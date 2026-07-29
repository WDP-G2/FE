import { Image, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/theme';

export default function NewsCard({ image, title, tag }) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: image }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.tag}>{tag}</Text>
        <Text numberOfLines={2} style={styles.title}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 76,
    borderWidth: 1,
    borderColor: colors.darkBorder,
    borderRadius: 13,
    backgroundColor: colors.darkSurface,
    padding: 9,
  },
  image: {
    width: 51,
    height: 51,
    borderRadius: 9,
    backgroundColor: colors.darkSurfaceSoft,
  },
  content: {
    flex: 1,
    marginLeft: 10,
  },
  tag: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '900',
  },
  title: {
    marginTop: 4,
    color: colors.darkText,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 15,
  },
});
