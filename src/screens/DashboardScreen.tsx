import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Briefcase,
  Building2,
  CalendarClock,
  ChevronDown,
  ChevronRight,
  Clock,
  CreditCard,
  FileClock,
  FileText,
  Folder,
  MapPin,
  Package,
  Search,
  Settings,
  Truck,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react-native';

import ScopeSheet, { type Organisation } from '../components/ScopeSheet';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useUser } from '../contexts/UserContext';
import Toast from '../components/Toast';
import { styles } from './DashboardScreen.styles';
import { theme, colors, vizTint } from '../theme/tokens';

type DashboardNavigationProp = NativeStackNavigationProp<RootStackParamList>;

type SectionItem = {
  Icon: LucideIcon;
  title: string;
  subtitle: string;
  color: string;
  tint: string;
  screen?: keyof RootStackParamList;
};

type SectionGroup = {
  label: string;
  items: SectionItem[];
};

const SECTION_GROUPS: SectionGroup[] = [
  {
    label: 'Expenses',
    items: [
      {
        Icon: FileText,
        title: 'All expenses',
        subtitle: 'Every expense across the selected scope',
        color: colors.viz1,
        tint: vizTint.viz1,
        screen: 'AllExpenses',
      },
      // {
      //   Icon: FileClock,
      //   title: 'Draft expenses',
      //   subtitle: 'Created but not yet submitted',
      //   color: colors.viz1,
      //   tint: vizTint.viz1,
      // },
      {
        Icon: Folder,
        title: 'Categories',
        subtitle: 'Expense categories and their configuration',
        color: colors.viz1,
        tint: vizTint.viz1,
        screen: 'Categories',
      },
    ],
  },
  {
    label: 'Organisation',
    items: [
      {
        Icon: Building2,
        title: 'Organisations',
        subtitle: 'Organisations within this tenant',
        color: colors.viz3,
        tint: vizTint.viz3,
      },
      {
        Icon: Truck,
        title: 'Vendors',
        subtitle: 'Vendor directory and contact details',
        color: colors.viz3,
        tint: vizTint.viz3,
        screen: 'Vendors',
      },
    ],
  },
  {
    label: 'Assets',
    items: [
      {
        Icon: Package,
        title: 'Assets',
        subtitle: 'Asset register and assignment',
        color: colors.viz4,
        tint: vizTint.viz4,
      },
    ],
  },
  {
    label: 'Maintenance',
    items: [
      {
        Icon: Wrench,
        title: 'Maintenance',
        subtitle: 'Requests, work orders and schedules',
        color: colors.viz5,
        tint: vizTint.viz5,
      },
    ],
  },
  {
    label: 'Other',
    items: [
      {
        Icon: Users,
        title: 'Payees',
        subtitle: 'Payee directory and management',
        color: colors.viz5,
        tint: vizTint.viz5,
      },
      {
        Icon: Building2,
        title: 'Departments',
        subtitle: 'Department configuration and details',
        color: colors.viz5,
        tint: vizTint.viz5,
      },
      {
        Icon: Briefcase,
        title: 'Projects',
        subtitle: 'Project tracking and allocation',
        color: colors.viz5,
        tint: vizTint.viz5,
      },
    ],
  },
  {
    label: 'Reports',
    items: [
      {
        Icon: BarChart3,
        title: 'Analytics',
        subtitle: 'Spend and operations reporting',
        color: colors.viz6,
        tint: vizTint.viz6,
      },
    ],
  },
];

const KPI_CARDS: {
  Icon: LucideIcon;
  label: string;
  value: string;
  badge?: { text: string; bg: string; color: string };
}[] = [
  { Icon: CreditCard, label: 'Total spend', value: '₹ 8.4L' },
  { Icon: Clock, label: 'Pending approval', value: '14' },
  {
    Icon: AlertTriangle,
    label: 'Overdue',
    value: '5',
    badge: { text: 'Overdue', bg: theme.statusDangerBg, color: theme.statusDangerStrong },
  },
  {
    Icon: CalendarClock,
    label: 'Due soon',
    value: '9',
    badge: { text: 'Due soon', bg: theme.statusWarningBg, color: theme.statusWarningStrong },
  },
];

export default function DashboardScreen() {
  const navigation = useNavigation<DashboardNavigationProp>();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetTab, setSheetTab] = useState<'organisation' | 'branch'>('organisation');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const { isLoading, getOrganisations, getCurrentOrganisation, getCurrentBranch, setCurrentContext, user } = useUser();
  const organisations = getOrganisations();

  const getUserInitials = (): string => {
    if (!user?.name) return '?';
    return user.name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  const currentOrg = getCurrentOrganisation();
  const currentBranch = getCurrentBranch();

  console.log('[Dashboard] Rendering - isLoading:', isLoading, 'currentOrg:', currentOrg?.name, 'currentBranch:', currentBranch?.name, 'orgs:', organisations.length);

  if (isLoading || !currentOrg || !currentBranch) {
    console.log('[Dashboard] Showing loading state - isLoading:', isLoading, 'currentOrg:', !!currentOrg, 'currentBranch:', !!currentBranch);
    return (
      <SafeAreaView style={styles.flex} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.brandDefault} />
        </View>
      </SafeAreaView>
    );
  }

  const openSheet = (tab: 'organisation' | 'branch') => {
    setSheetTab(tab);
    setSheetOpen(true);
  };

  const handleApply = async (newOrgId: string, newBranchId: string | null) => {
    try {
      if (!newBranchId) return;
      await setCurrentContext({
        organisation_id: newOrgId,
        branch_id: newBranchId,
      });
      setSheetOpen(false);
    } catch (error) {
      setToastMessage('Failed to update organisation/branch');
      setToastVisible(true);
    }
  };

  return (
    <SafeAreaView style={styles.flex} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Image
            source={require('../../assets/images/addmin-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.headerActions}>
            <View style={styles.bellWrap}>
              <View style={styles.bellButton}>
                <Bell size={20} color={theme.textPrimary} strokeWidth={1.75} />
              </View>
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>3</Text>
              </View>
            </View>
            <Pressable
              style={styles.avatar}
              onPress={() => navigation.navigate('Profile')}
            >
              <Text style={styles.avatarText}>{getUserInitials()}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.scopeRow}>
          <Pressable style={styles.scopePill} onPress={() => openSheet('organisation')}>
            <Building2 size={16} color={theme.textTertiary} strokeWidth={1.75} />
            <Text style={styles.scopePillText} numberOfLines={1}>
              {currentOrg.name}
            </Text>
            <ChevronDown size={16} color={theme.textTertiary} strokeWidth={2} />
          </Pressable>
          <Pressable style={styles.scopePill} onPress={() => openSheet('branch')}>
            <MapPin size={16} color={theme.textTertiary} strokeWidth={1.75} />
            <Text style={styles.scopePillText} numberOfLines={1}>
              {currentBranch.name}
            </Text>
            <ChevronDown size={16} color={theme.textTertiary} strokeWidth={2} />
          </Pressable>
        </View>

        <View style={styles.searchBar}>
          <Search size={18} color={theme.textTertiary} strokeWidth={1.75} />
          <Text style={styles.searchPlaceholder}>Search sections</Text>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>Overview</Text>
          <Text style={styles.showAll}>Show all</Text>
        </View>

        <View style={styles.kpiGrid}>
          {KPI_CARDS.map((card) => (
            <View key={card.label} style={styles.kpiCard}>
              <card.Icon size={18} color={theme.textSecondary} strokeWidth={1.75} />
              <Text style={styles.kpiLabel}>{card.label}</Text>
              <Text style={styles.kpiValue}>{card.value}</Text>
              {card.badge ? (
                <View style={[styles.kpiBadge, { backgroundColor: card.badge.bg }]}>
                  <Text style={[styles.kpiBadgeText, { color: card.badge.color }]}>
                    {card.badge.text}
                  </Text>
                </View>
              ) : null}
            </View>
          ))}
        </View>

        <View style={styles.groupList}>
          {SECTION_GROUPS.map((group) => (
            <View key={group.label}>
              <Text style={styles.groupLabel}>{group.label}</Text>
              <View style={styles.groupCard}>
                {group.items.map((item, index) => (
                  <Pressable
                    key={item.title}
                    style={[
                      styles.row,
                      index < group.items.length - 1 && styles.rowDivider,
                    ]}
                    disabled={!item.screen}
                    onPress={item.screen ? () => navigation.navigate(item.screen!) : undefined}
                  >
                    <View style={[styles.rowIcon, { backgroundColor: item.tint }]}>
                      <item.Icon size={20} color={item.color} strokeWidth={1.75} />
                    </View>
                    <View style={styles.rowText}>
                      <Text style={styles.rowTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.rowSubtitle} numberOfLines={1}>
                        {item.subtitle}
                      </Text>
                    </View>
                    <ChevronRight size={18} color={theme.textTertiary} strokeWidth={2} />
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <ScopeSheet
        visible={sheetOpen}
        initialTab={sheetTab}
        orgs={organisations}
        selectedOrgId={currentOrg.id}
        selectedBranchId={currentBranch.id}
        onApply={handleApply}
        onClose={() => setSheetOpen(false)}
      />

      <Toast
        visible={toastVisible}
        message={toastMessage}
        type="error"
        onHide={() => setToastVisible(false)}
      />
    </SafeAreaView>
  );
}
