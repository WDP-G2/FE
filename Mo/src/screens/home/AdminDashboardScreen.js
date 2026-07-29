import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import AdminHeader from '../../components/home/AdminHeader';
import AdminMetricCard from '../../components/home/AdminMetricCard';
import AdminPageTitle from '../../components/home/AdminPageTitle';
import HeroCard from '../../components/home/HeroCard';
import HomeSectionHeader from '../../components/home/HomeSectionHeader';
import NewsCard from '../../components/home/NewsCard';
import RaceCard from '../../components/home/RaceCard';
import RankingCard from '../../components/home/RankingCard';
import StatCard from '../../components/home/StatCard';
import { colors } from '../../constants/theme';

const raceImage =
  'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=700&q=80';
const newsImage =
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=500&q=80';

export default function AdminDashboardScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <AdminHeader subtitle="Championship" />
      <AdminPageTitle
        highlight={'B\u1ea3ng \u0111i\u1ec1u khi\u1ec3n'}
        subtitle={'Th\u1ed1ng k\u00ea h\u1ec7 th\u1ed1ng qu\u1ea3n l\u00fd gi\u1ea3i \u0111ua ng\u1ef1a'}
        title={'T\u1ed5ng quan'}
      />
      <View style={styles.metricGrid}>
        <AdminMetricCard icon="trophy-outline" label={'T\u1ed5ng gi\u1ea3i \u0111\u1ea5u'} tone="gold" trend="+12%" value="4" />
        <AdminMetricCard icon="flag-outline" label={'T\u1ed5ng cu\u1ed9c \u0111ua'} tone="blue" trend="+8%" value="23" />
      </View>
      <View style={styles.metricGrid}>
        <AdminMetricCard icon="people-outline" label={'Ng\u01b0\u1eddi tham gia'} tone="green" trend="+24%" value="160" />
        <AdminMetricCard icon="cash-outline" label={'Doanh thu'} tone="gold" trend="+18%" value="200.000.000" />
      </View>
      <HeroCard />

      <HomeSectionHeader title={'Gi\u1ea3i \u0111\u1ea5u s\u1eafp t\u1edbi'} action={'Xem t\u1ea5t c\u1ea3'} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.raceList}>
          <RaceCard
            date="15 Thg 10, 2024"
            image={raceImage}
            location={'S\u00e2n v\u1eadn \u0111\u1ed9ng Qu\u1ed1c gia'}
            name="Grand Prix Championship 2024"
            prize="$250,000"
            status={'S\u1eafp di\u1ec5n ra'}
          />
          <RaceCard
            date="22 Thg 10, 2024"
            image={raceImage}
            location={'H\u00e0 N\u1ed9i'}
            name="Autumn Derby Series"
            prize="$180,000"
            status={'M\u1edf \u0111\u0103ng k\u00fd'}
          />
        </View>
      </ScrollView>

      <HomeSectionHeader title={'Vi\u1ec7c c\u1ea7n x\u1eed l\u00fd'} />
      <View style={styles.todoPanel}>
        <TodoItem count="12" icon="person-add-outline" title={'Duy\u1ec7t \u0111\u0103ng k\u00fd tham gia'} />
        <TodoItem count="04" icon="flag-outline" title={'Ph\u00e2n c\u00f4ng tr\u1ecdng t\u00e0i'} />
        <TodoItem count="03" icon="medal-outline" title={'C\u00f4ng b\u1ed1 k\u1ebft qu\u1ea3 ch\u1edd duy\u1ec7t'} />
      </View>

      <HomeSectionHeader title={'B\u1ea3ng x\u1ebfp h\u1ea1ng'} />
      <View style={styles.panel}>
        <RankingCard name="Thunderbolt" rank={1} rate="94% Win Rate" subtitle={'Ch\u1ee7 s\u1edf h\u1eefu: L\u00ea V\u0103n A'} />
        <RankingCard name="Golden Stallion" rank={2} rate="88% Win Rate" subtitle={'Ch\u1ee7 s\u1edf h\u1eefu: Nguy\u1ec5n Kim'} />
        <RankingCard name="Midnight Blue" rank={3} rate="82% Win Rate" subtitle={'Ch\u1ee7 s\u1edf h\u1eefu: Tr\u1ea7n H\u00e0'} />
      </View>

      <HomeSectionHeader title={'Th\u1ed1ng k\u00ea h\u1ec7 th\u1ed1ng'} />
      <View style={styles.statsGrid}>
        <StatCard icon="trophy-outline" label={'GI\u1ea2I \u0110\u1ea4U'} value="156" />
        <StatCard icon="footsteps-outline" label={'NG\u1ef0A \u0110UA'} value="328" />
      </View>
      <View style={styles.statsGrid}>
        <StatCard icon="flag-outline" label={'N\u00c0I NG\u1ef0A'} value="145" />
        <StatCard icon="people-outline" label={'KH\u00c1N GI\u1ea2'} value="2,845" />
      </View>

      <HomeSectionHeader title={'Tin t\u1ee9c n\u1ed5i b\u1eadt'} />
      <View style={styles.newsRow}>
        <NewsCard image={newsImage} tag={'K\u1ef8 THU\u1eacT'} title={'B\u00ed quy\u1ebft hu\u1ea5n luy\u1ec7n ng\u1ef1a v\u00f4 \u0111\u1ecbch'} />
        <NewsCard image={raceImage} tag={'S\u1ef0 KI\u1ec6N'} title={'L\u1ecbch thi \u0111\u1ea5u th\u00e1ng n\u00e0y'} />
      </View>
    </ScrollView>
  );
}

function TodoItem({ icon, title, count }) {
  return (
    <View style={styles.todoItem}>
      <View style={styles.todoIcon}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <Text style={styles.todoTitle}>{title}</Text>
      <Text style={styles.todoCount}>{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 15,
    paddingTop: 14,
    paddingBottom: 22,
  },
  raceList: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 15,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  panel: {
    borderWidth: 1,
    borderColor: colors.darkBorder,
    borderRadius: 13,
    backgroundColor: colors.darkSurface,
    paddingHorizontal: 13,
  },
  todoPanel: {
    borderWidth: 1,
    borderColor: colors.darkBorder,
    borderRadius: 13,
    backgroundColor: colors.darkSurface,
    paddingHorizontal: 12,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: '#1D2A40',
  },
  todoIcon: {
    width: 31,
    height: 31,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: colors.darkSurfaceSoft,
  },
  todoTitle: {
    flex: 1,
    marginLeft: 10,
    color: colors.darkText,
    fontSize: 12,
    fontWeight: '800',
  },
  todoCount: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '900',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  newsRow: {
    flexDirection: 'row',
    gap: 12,
  },
});
