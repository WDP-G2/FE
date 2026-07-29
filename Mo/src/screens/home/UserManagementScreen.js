import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import AdminHeader from '../../components/home/AdminHeader';
import AdminPageTitle from '../../components/home/AdminPageTitle';
import SearchBar from '../../components/home/SearchBar';
import { colors } from '../../constants/theme';

const users = [
  { code: 'N', name: 'Nguy\u1ec5n V\u0103n A', contact: 'vana@hr.vn', role: 'Ch\u1ee7 ng\u1ef1a', status: '\u0110ang ho\u1ea1t \u0111\u1ed9ng', profile: '3 ng\u1ef1a \u00b7 12 gi\u1ea3i \u0111\u1ea5u' },
  { code: 'T', name: 'Tr\u1ea7n Minh T\u00fa', contact: 'tu.tm@hr.vn', role: 'Jockey', status: '\u0110ang ho\u1ea1t \u0111\u1ed9ng', profile: '24 th\u00e1ng \u00b7 Win 78%' },
  { code: 'P', name: 'Ph\u1ea1m Ho\u00e0ng', contact: 'hoang.p@hr.vn', role: 'Jockey', status: 'T\u1ea1m kh\u00f3a', profile: '12 th\u00e1ng \u00b7 Win 65%' },
];

const requests = [
  { id: 'REQ-2026-014', name: '\u0110\u1eb7ng Quang Huy', from: 'Kh\u00e1n gi\u1ea3', to: 'Jockey', files: '4 file', status: 'Ch\u1edd duy\u1ec7t' },
  { id: 'REQ-2026-013', name: 'V\u0169 \u0110\u1ee9c M\u1ea1nh', from: 'Kh\u00e1n gi\u1ea3', to: 'Ch\u1ee7 ng\u1ef1a', files: '3 file', status: 'Ch\u1edd duy\u1ec7t' },
];

export default function UserManagementScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <AdminHeader subtitle="User Management" />
      <AdminPageTitle
        highlight={'Qu\u1ea3n l\u00fd'}
        subtitle={'Ch\u1ee7 ng\u1ef1a, jockey, tr\u1ecdng t\u00e0i, kh\u00e1n gi\u1ea3 v\u00e0 y\u00eau c\u1ea7u c\u1ea5p quy\u1ec1n'}
        title={'Ng\u01b0\u1eddi d\u00f9ng'}
      />

      <View style={styles.primaryButton}>
        <Ionicons name="person-add-outline" size={18} color="#1D1705" />
        <Text style={styles.primaryButtonText}>{'M\u1eddi ng\u01b0\u1eddi d\u00f9ng'}</Text>
      </View>

      <View style={styles.segmentRow}>
        <View style={styles.segmentActive}>
          <Text style={styles.segmentActiveText}>{'Danh s\u00e1ch ng\u01b0\u1eddi d\u00f9ng'}</Text>
          <Text style={styles.badge}>9</Text>
        </View>
        <View style={styles.segment}>
          <Text style={styles.segmentText}>{'Y\u00eau c\u1ea7u c\u1ea5p quy\u1ec1n'}</Text>
          <Text style={styles.badgeMuted}>5</Text>
        </View>
      </View>

      <View style={styles.panel}>
        <View style={styles.filterRow}>
          <View style={styles.searchWrap}>
            <SearchBar placeholder={'T\u00ecm theo t\u00ean ho\u1eb7c email...'} />
          </View>
          <View style={styles.filterPill}>
            <Text style={styles.filterText}>{'T\u1ea5t c\u1ea3'}</Text>
          </View>
        </View>
        {users.map((user) => (
          <UserRow key={user.contact} user={user} />
        ))}
      </View>

      <View style={styles.notice}>
        <Ionicons name="sparkles-outline" size={22} color={colors.primary} />
        <Text style={styles.noticeText}>
          {'Kh\u00e1n gi\u1ea3 c\u00f3 th\u1ec3 n\u1ed9p y\u00eau c\u1ea7u n\u00e2ng c\u1ea5p th\u00e0nh Jockey, Ch\u1ee7 ng\u1ef1a ho\u1eb7c Tr\u1ecdng t\u00e0i. Admin x\u00e9t duy\u1ec7t t\u1ea1i \u0111\u00e2y.'}
        </Text>
      </View>

      <View style={styles.panel}>
        {requests.map((request) => (
          <RequestRow key={request.id} request={request} />
        ))}
      </View>
    </ScrollView>
  );
}

function UserRow({ user }) {
  const isLocked = user.status !== '\u0110ang ho\u1ea1t \u0111\u1ed9ng';

  return (
    <View style={styles.userRow}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{user.code}</Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userMeta}>{user.contact}</Text>
        <Text style={styles.userMeta}>{user.profile}</Text>
      </View>
      <View style={styles.rolePill}>
        <Text style={styles.roleText}>{user.role}</Text>
      </View>
      <View style={[styles.statusPill, isLocked && styles.lockedPill]}>
        <Text style={[styles.statusText, isLocked && styles.lockedText]}>{user.status}</Text>
      </View>
    </View>
  );
}

function RequestRow({ request }) {
  return (
    <View style={styles.requestRow}>
      <Text style={styles.requestId}>{request.id}</Text>
      <View style={styles.requestMain}>
        <Text style={styles.userName}>{request.name}</Text>
        <Text style={styles.userMeta}>{request.from} {'\u2192'} {request.to}</Text>
        <Text style={styles.userMeta}>{request.files}</Text>
      </View>
      <View style={styles.pendingPill}>
        <Text style={styles.pendingText}>{request.status}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 15,
    paddingTop: 14,
    paddingBottom: 22,
  },
  primaryButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
    borderRadius: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#1D1705',
    fontSize: 13,
    fontWeight: '900',
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  segmentActive: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: colors.primary,
    paddingVertical: 12,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.darkBorder,
    borderRadius: 16,
    backgroundColor: colors.darkSurface,
    paddingVertical: 12,
  },
  segmentActiveText: {
    color: '#1D1705',
    fontSize: 12,
    fontWeight: '900',
  },
  segmentText: {
    color: colors.darkTextMuted,
    fontSize: 12,
    fontWeight: '900',
  },
  badge: {
    marginLeft: 8,
    color: '#1D1705',
    fontSize: 11,
    fontWeight: '900',
  },
  badgeMuted: {
    marginLeft: 8,
    color: colors.darkTextMuted,
    fontSize: 11,
    fontWeight: '900',
  },
  panel: {
    borderWidth: 1,
    borderColor: colors.darkBorder,
    borderRadius: 16,
    backgroundColor: colors.darkSurface,
    overflow: 'hidden',
  },
  filterRow: {
    padding: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.darkBorder,
  },
  searchWrap: {
    flex: 1,
  },
  filterPill: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    backgroundColor: colors.darkSurfaceSoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterText: {
    color: colors.darkText,
    fontSize: 12,
    fontWeight: '800',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1D2A40',
  },
  avatar: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: colors.primary,
  },
  avatarText: {
    color: '#1D1705',
    fontSize: 16,
    fontWeight: '900',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: colors.darkText,
    fontSize: 13,
    fontWeight: '900',
  },
  userMeta: {
    marginTop: 3,
    color: colors.darkTextMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  rolePill: {
    borderRadius: 14,
    backgroundColor: '#3A2F1B',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  roleText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '900',
  },
  statusPill: {
    borderRadius: 14,
    backgroundColor: '#083C33',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  statusText: {
    color: '#6EE7B7',
    fontSize: 9,
    fontWeight: '900',
  },
  lockedPill: {
    backgroundColor: '#47242B',
  },
  lockedText: {
    color: '#FDA4AF',
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: colors.darkBorder,
    borderRadius: 16,
    backgroundColor: colors.warningSurface,
    padding: 14,
  },
  noticeText: {
    flex: 1,
    color: colors.darkTextMuted,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 17,
  },
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1D2A40',
  },
  requestId: {
    width: 68,
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  requestMain: {
    flex: 1,
  },
  pendingPill: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  pendingText: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '900',
  },
});
