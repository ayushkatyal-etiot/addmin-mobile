import React, { useState, useMemo } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import { theme, space, radius } from '../theme/tokens';

interface DatePickerSheetProps {
  visible: boolean;
  title: string;
  selectedDate?: string; // Format: DD/MM/YYYY
  onDateSelect: (dateStr: string) => void; // Returns DD/MM/YYYY format
  onClose: () => void;
}

export default function DatePickerSheet({
  visible,
  title,
  selectedDate,
  onDateSelect,
  onClose,
}: DatePickerSheetProps) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());

  const parseDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return { day: parseInt(parts[0]), month: parseInt(parts[1]) - 1, year: parseInt(parts[2]) };
    }
    return null;
  };

  const selectedParsed = useMemo(() => parseDate(selectedDate), [selectedDate]);

  const daysInMonth = (m: number, y: number) => {
    return new Date(y, m + 1, 0).getDate();
  };

  const firstDayOfMonth = (m: number, y: number) => {
    return new Date(y, m, 1).getDay();
  };

  const monthName = (m: number) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return months[m];
  };

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const days = useMemo(() => {
    const totalDays = daysInMonth(month, year);
    const firstDay = firstDayOfMonth(month, year);
    const calendarDays = [];

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(null);
    }

    // Days of the month
    for (let day = 1; day <= totalDays; day++) {
      calendarDays.push(day);
    }

    return calendarDays;
  }, [month, year]);

  const isSelected = (day: number | null) => {
    if (!day || !selectedParsed) return false;
    return day === selectedParsed.day && month === selectedParsed.month && year === selectedParsed.year;
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.sheetRoot}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandleRow}>
            <View style={styles.sheetHandle} />
          </View>

          <View style={styles.sheetTitleRow}>
            <Text style={styles.sheetTitle}>{title}</Text>
            <Pressable style={styles.sheetCloseButton} onPress={onClose}>
              <X size={16} color={theme.textSecondary} strokeWidth={2} />
            </Pressable>
          </View>

          <View style={styles.monthHeader}>
            <Pressable style={styles.monthArrow} onPress={handlePrevMonth}>
              <ChevronLeft size={20} color={theme.textPrimary} strokeWidth={2} />
            </Pressable>
            <Text style={styles.monthYear}>{monthName(month)} {year}</Text>
            <Pressable style={styles.monthArrow} onPress={handleNextMonth}>
              <ChevronRight size={20} color={theme.textPrimary} strokeWidth={2} />
            </Pressable>
          </View>

          <View style={styles.weekdaysRow}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <Text key={day} style={styles.weekdayText}>{day}</Text>
            ))}
          </View>

          <ScrollView contentContainerStyle={styles.calendarGrid}>
            {days.map((day, index) => {
              const selected = isSelected(day);
              const todayFlag = isToday(day);

              return (
                <Pressable
                  key={index}
                  style={[
                    styles.calendarDay,
                    selected && styles.calendarDaySelected,
                    todayFlag && !selected && styles.calendarDayToday,
                    !day && styles.calendarDayEmpty,
                  ]}
                  onPress={() => {
                    if (day) {
                      const dateStr = `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;
                      onDateSelect(dateStr);
                      onClose();
                    }
                  }}
                  disabled={!day}
                >
                  {day && (
                    <Text
                      style={[
                        styles.calendarDayText,
                        selected && styles.calendarDayTextSelected,
                        todayFlag && !selected && styles.calendarDayTextToday,
                      ]}
                    >
                      {day}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheetRoot: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: theme.bgOverlay,
  },
  sheet: {
    backgroundColor: theme.bgRaised,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: space[6],
  },
  sheetHandleRow: {
    alignItems: 'center',
    paddingTop: space[3],
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: theme.borderStrong,
  },
  sheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space[5],
    paddingTop: space[4],
    marginBottom: space[4],
  },
  sheetTitle: {
    fontSize: 18,
    fontFamily: 'Urbanist_600SemiBold',
    color: theme.textPrimary,
  },
  sheetCloseButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: theme.bgSunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space[5],
    marginBottom: space[4],
  },
  monthArrow: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthYear: {
    fontSize: 16,
    fontFamily: 'Urbanist_600SemiBold',
    color: theme.textPrimary,
  },
  weekdaysRow: {
    flexDirection: 'row',
    paddingHorizontal: space[5],
    marginBottom: space[2],
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Urbanist_500Medium',
    color: theme.textTertiary,
  },
  calendarGrid: {
    paddingHorizontal: space[3],
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.285%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    marginBottom: space[2],
  },
  calendarDayEmpty: {
    backgroundColor: 'transparent',
  },
  calendarDaySelected: {
    backgroundColor: theme.brandDefault,
  },
  calendarDayToday: {
    borderWidth: 2,
    borderColor: theme.brandDefault,
  },
  calendarDayText: {
    fontSize: 14,
    fontFamily: 'Urbanist_600SemiBold',
    color: theme.textPrimary,
  },
  calendarDayTextSelected: {
    color: theme.textOnBrand,
  },
  calendarDayTextToday: {
    color: theme.brandDefault,
  },
});
