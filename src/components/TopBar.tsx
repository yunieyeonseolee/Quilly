import { TouchableOpacity, View } from 'react-native';
import { Text } from './Text';
import { homeStyles as styles } from '../styles/homeStyles';
import { monthNames } from '../utils/dateUtils';

type TopBarProps = {
  currentDate: Date;
  viewMode: 'calendar' | 'list';
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToggleView: () => void;
  onMonthYearPress?: () => void;
};

export const TopBar = ({
  currentDate,
  viewMode,
  onPreviousMonth,
  onNextMonth,
  onToggleView,
  onMonthYearPress,
}: TopBarProps) => {
  return (
    <View style={styles.topBar}>
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={onPreviousMonth}>
          <Text style={styles.arrow}>‹</Text>
        </TouchableOpacity>

        
        <TouchableOpacity onPress={onMonthYearPress} disabled={!onMonthYearPress}>
          <Text style={styles.monthText}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onNextMonth}>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.topBarRight}>
        <TouchableOpacity style={styles.iconButton} onPress={onToggleView}>
          <Text style={styles.iconText}>{viewMode === 'calendar' ? '☰' : '📅'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton}>
          <Text style={styles.iconText}>🔍</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
