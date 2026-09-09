import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  AlertTriangle,
  BarChart3,
  Bell,
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
  Truck,
  Wrench,
  type LucideIcon,
} from 'lucide-react-native';

import { colors, radius, space, theme, type, vizTint } from '../theme/tokens';
import ScopeSheet, { type Organisation } from '../components/ScopeSheet';
import type { RootStackParamList } from '../../App';

type DashboardNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ORGS: Organisation[] = [
  {
    id: 'acme-industries',
    name: 'Acme Industries Pvt Ltd',
    branches: [
      { id: 'andheri-east', name: 'Andheri East', city: 'Mumbai' },
      { id: 'powai-office', name: 'Powai Office', city: 'Mumbai' },
      { id: 'hdfc-tower-3f', name: 'HDFC Tower 3F', city: 'Mumbai' },
      { id: 'cyber-city-11f', name: 'Cyber City 11F', city: 'Gurugram' },
    ],
  },
  {
    id: 'acme-logistics',
    name: 'Acme Logistics Pvt Ltd',
    branches: [
      { id: 'whitefield-campus', name: 'Whitefield Campus', city: 'Bengaluru' },
      { id: 'whitefield-annex', name: 'Whitefield Annex', city: 'Bengaluru' },
    ],
  },
  {
    id: 'acme-realty',
    name: 'Acme Realty Pvt Ltd',
    branches: [],
  },
];

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
      {
        Icon: FileClock,
        title: 'Draft expenses',
        subtitle: 'Created but not yet submitted',
        color: colors.viz1,
        tint: vizTint.viz1,
      },
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
    label: 'Procurement',
    items: [
      {
        Icon: Truck,
        title: 'Vendors',
        subtitle: 'Vendor directory and contact details',
        color: colors.viz2,
        tint: vizTint.viz2,
        screen: 'Vendors',
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
        Icon: MapPin,
        title: 'Branches',
        subtitle: 'Branches under the selected organisation',
        color: colors.viz3,
        tint: vizTint.viz3,
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
  const [orgId, setOrgId] = useState(ORGS[0].id);
  const [branchId, setBranchId] = useState<string | null>(ORGS[0].branches[0].id);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetTab, setSheetTab] = useState<'organisation' | 'branch'>('organisation');

  const org = ORGS.find((o) => o.id === orgId)!;
  const branch = org.branches.find((b) => b.id === branchId) ?? null;

  const openSheet = (tab: 'organisation' | 'branch') => {
    setSheetTab(tab);
    setSheetOpen(true);
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
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>JS</Text>
            </View>
          </View>
        </View>

        <View style={styles.scopeRow}>
          <Pressable style={styles.scopePill} onPress={() => openSheet('organisation')}>
            <Building2 size={16} color={theme.textTertiary} strokeWidth={1.75} />
            <Text style={styles.scopePillText} numberOfLines={1}>
              {org.name}
            </Text>
            <ChevronDown size={16} color={theme.textTertiary} strokeWidth={2} />
          </Pressable>
          <Pressable style={styles.scopePill} onPress={() => openSheet('branch')}>
            <MapPin size={16} color={theme.textTertiary} strokeWidth={1.75} />
            <Text style={styles.scopePillText} numberOfLines={1}>
              {branch ? branch.name : 'No branch'}
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
        orgs={ORGS}
        selectedOrgId={orgId}
        selectedBranchId={branchId}
        onApply={(newOrgId, newBranchId) => {
          setOrgId(newOrgId);
          setBranchId(newBranchId);
        }}
        onClose={() => setSheetOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: theme.bgPage,
  },
  scrollContent: {
    paddingBottom: 112,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space[6],
  },
  logo: {
    width: 120,
    aspectRatio: 1376 / 768,
  },
  headerActions: {
    flexDirection: 'row',
    gap: space[3],
  },
  bellWrap: {
    width: 44,
    height: 44,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: theme.bgRaised,
    borderWidth: 1,
    borderColor: theme.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: radius.full,
    backgroundColor: theme.statusDanger,
    borderWidth: 2,
    borderColor: theme.bgPage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadgeText: {
    fontSize: 11,
    fontFamily: 'Urbanist_700Bold',
    color: theme.textInverse,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: theme.brandSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontFamily: 'Urbanist_700Bold',
    color: theme.brandDefault,
  },
  scopeRow: {
    flexDirection: 'row',
    gap: space[3],
    marginTop: space[4],
    paddingHorizontal: space[6],
  },
  scopePill: {
    flex: 1,
    height: 40,
    paddingHorizontal: space[3],
    backgroundColor: theme.bgRaised,
    borderWidth: 1,
    borderColor: theme.borderDefault,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1] + 2,
  },
  scopePillText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Urbanist_600SemiBold',
    color: theme.textPrimary,
  },
  searchBar: {
    marginTop: space[4],
    marginHorizontal: space[6],
    height: 44,
    paddingHorizontal: space[3],
    backgroundColor: theme.bgRaised,
    borderWidth: 1,
    borderColor: theme.borderDefault,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  searchPlaceholder: {
    ...type.body,
    color: theme.textTertiary,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: space[6],
    paddingHorizontal: space[6],
  },
  sectionHeaderTitle: {
    ...type.h3,
    color: theme.textPrimary,
  },
  showAll: {
    fontSize: 13,
    fontFamily: 'Urbanist_600SemiBold',
    color: theme.brandDefault,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[3],
    marginTop: space[3],
    paddingHorizontal: space[6],
  },
  kpiCard: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: theme.bgRaised,
    borderWidth: 1,
    borderColor: theme.borderSubtle,
    borderRadius: radius.lg,
    padding: space[4],
  },
  kpiLabel: {
    fontSize: 13,
    fontFamily: 'Urbanist_600SemiBold',
    color: theme.textSecondary,
    marginTop: space[2],
  },
  kpiValue: {
    fontSize: 28,
    fontFamily: 'Urbanist_700Bold',
    color: theme.textPrimary,
    marginTop: space[1],
  },
  kpiBadge: {
    alignSelf: 'flex-start',
    height: 20,
    paddingHorizontal: space[2],
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space[2],
  },
  kpiBadgeText: {
    fontSize: 12,
    fontFamily: 'Urbanist_600SemiBold',
  },
  groupList: {
    gap: space[5],
    marginTop: space[6],
    paddingHorizontal: space[6],
  },
  groupLabel: {
    fontSize: 13,
    fontFamily: 'Urbanist_600SemiBold',
    letterSpacing: 0.26,
    color: theme.textSecondary,
    marginBottom: space[2],
  },
  groupCard: {
    backgroundColor: theme.bgRaised,
    borderWidth: 1,
    borderColor: theme.borderSubtle,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingHorizontal: space[4],
    paddingVertical: space[3],
    minHeight: 44,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: theme.borderSubtle,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontFamily: 'Urbanist_600SemiBold',
    color: theme.textPrimary,
  },
  rowSubtitle: {
    fontSize: 12,
    fontFamily: 'Urbanist_500Medium',
    color: theme.textSecondary,
    marginTop: 2,
  },
});
