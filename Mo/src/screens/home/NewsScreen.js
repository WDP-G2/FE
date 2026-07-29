import { Ionicons } from '@expo/vector-icons';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import AdminHeader from '../../components/home/AdminHeader';
import AdminPageTitle from '../../components/home/AdminPageTitle';
import SearchBar from '../../components/home/SearchBar';
import { colors } from '../../constants/theme';

const newsImage =
  'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=500&q=80';

const posts = [
  { title: 'Thunder Strike Gi\u00e0nh Chi\u1ebfn Th\u1eafng T\u1ea1i Vietnam Grand Prix...', category: 'K\u1ebft qu\u1ea3 \u0111ua', date: '20/05/2026', status: '\u0110\u00e3 xu\u1ea5t b\u1ea3n', featured: true },
  { title: 'Championship Cup 2026: S\u1eb5n S\u00e0ng Cho M\u00f9a Gi\u1ea3i M\u1edbi', category: 'S\u1ef1 ki\u1ec7n', date: '19/05/2026', status: '\u0110\u00e3 xu\u1ea5t b\u1ea3n', featured: true },
  { title: 'Golden Flash: H\u00e0nh Tr\u00ecnh T\u1eeb Ng\u1ef1a Non \u0110\u1ebfn Nh\u00e0 V\u00f4 \u0110\u1ecbch', category: 'Ch\u00e2n dung', date: '18/05/2026', status: '\u0110\u00e3 xu\u1ea5t b\u1ea3n', featured: false },
  { title: 'C\u00f4ng Ngh\u1ec7 AI Trong Hu\u1ea5n Luy\u1ec7n Ng\u1ef1a \u0110ua', category: 'C\u00f4ng ngh\u1ec7', date: '17/05/2026', status: 'B\u1ea3n nh\u00e1p', featured: false },
];

export default function NewsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <AdminHeader subtitle="News Management" />
      <AdminPageTitle
        highlight={'Qu\u1ea3n l\u00fd'}
        subtitle={'T\u1ea1o v\u00e0 qu\u1ea3n l\u00fd b\u00e0i vi\u1ebft tin t\u1ee9c'}
        title={'Tin t\u1ee9c'}
      />

      <View style={styles.createButton}>
        <Ionicons name="add" size={19} color="#1D1705" />
        <Text style={styles.createText}>{'T\u1ea1o b\u00e0i vi\u1ebft m\u1edbi'}</Text>
      </View>

      <View style={styles.filterCard}>
        <SearchBar placeholder={'T\u00ecm ki\u1ebfm b\u00e0i vi\u1ebft...'} />
        <View style={styles.statusFilter}>
          <Text style={styles.statusFilterText}>{'T\u1ea5t c\u1ea3 tr\u1ea1ng th\u00e1i'}</Text>
          <Ionicons name="chevron-down" size={17} color={colors.darkText} />
        </View>
      </View>

      <View style={styles.table}>
        {posts.map((post) => (
          <View key={post.title} style={styles.postRow}>
            <Image source={{ uri: newsImage }} style={styles.postImage} />
            <View style={styles.postMain}>
              <Text style={styles.postTitle}>{post.title}</Text>
              {post.featured ? (
                <View style={styles.featuredPill}>
                  <Text style={styles.featuredText}>{'N\u1ed5i b\u1eadt'}</Text>
                </View>
              ) : null}
              <Text style={styles.postDate}>{post.date}</Text>
            </View>
            <View style={styles.side}>
              <View style={styles.categoryPill}>
                <Text style={styles.categoryText}>{post.category}</Text>
              </View>
              <View style={[styles.publishPill, post.status !== '\u0110\u00e3 xu\u1ea5t b\u1ea3n' && styles.draftPill]}>
                <Text style={[styles.publishText, post.status !== '\u0110\u00e3 xu\u1ea5t b\u1ea3n' && styles.draftText]}>{post.status}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 15,
    paddingTop: 14,
    paddingBottom: 22,
  },
  createButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  createText: {
    color: '#1D1705',
    fontSize: 13,
    fontWeight: '900',
  },
  filterCard: {
    gap: 12,
    borderWidth: 1,
    borderColor: colors.darkBorder,
    borderRadius: 16,
    backgroundColor: colors.darkSurface,
    padding: 14,
  },
  statusFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.darkBorder,
    borderRadius: 13,
    backgroundColor: colors.darkSurfaceSoft,
    paddingHorizontal: 13,
    paddingVertical: 13,
  },
  statusFilterText: {
    color: colors.darkText,
    fontSize: 12,
    fontWeight: '800',
  },
  table: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.darkBorder,
    borderRadius: 16,
    backgroundColor: colors.darkSurface,
    overflow: 'hidden',
  },
  postRow: {
    flexDirection: 'row',
    gap: 12,
    padding: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#1D2A40',
  },
  postImage: {
    width: 66,
    height: 66,
    borderRadius: 10,
    backgroundColor: colors.darkSurfaceSoft,
  },
  postMain: {
    flex: 1,
  },
  postTitle: {
    color: colors.darkText,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
  },
  featuredPill: {
    alignSelf: 'flex-start',
    marginTop: 7,
    borderRadius: 8,
    backgroundColor: '#5A2B2F',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  featuredText: {
    color: '#FECACA',
    fontSize: 10,
    fontWeight: '900',
  },
  postDate: {
    marginTop: 7,
    color: colors.darkTextMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  side: {
    width: 82,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  categoryPill: {
    borderRadius: 10,
    backgroundColor: '#303226',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  categoryText: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '900',
  },
  publishPill: {
    borderRadius: 10,
    backgroundColor: '#D7FBE3',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  publishText: {
    color: '#08773B',
    fontSize: 9,
    fontWeight: '900',
  },
  draftPill: {
    backgroundColor: '#334155',
  },
  draftText: {
    color: colors.darkText,
  },
});
