import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { T, FONTS } from '../constants/theme';
import { LineChart } from '../components/LineChart';
import { MouseLogo } from '../components/MouseLogo';

const MOCK_WEIGHT: { date: string; weight: number }[] = [
  { date: '4/1', weight: 190.0 },
  { date: '4/5', weight: 189.5 },
  { date: '4/8', weight: 189.0 },
  { date: '4/11', weight: 188.5 },
  { date: '4/14', weight: 188.2 },
  { date: '4/17', weight: 187.8 },
  { date: '4/20', weight: 187.5 },
  { date: '4/23', weight: 187.0 },
  { date: '4/25', weight: 187.3 },
  { date: '4/26', weight: 187.0 },
  { date: '4/27', weight: 186.8 },
  { date: '4/28', weight: 187.0 },
];

const SESSIONS = [
  {
    date: '04/28',
    label: 'lower · legs',
    sets: 24,
    detail: '  barbell squat    225lb 4×6\n  romanian dl      185lb 3×8\n  leg press        360lb 3×12\n  leg curl          80lb 3×12',
  },
  {
    date: '04/24',
    label: 'upper · push',
    sets: 22,
    detail: '  bench press      185lb 4×8\n  incline db        70lb 3×10\n  ohp              115lb 3×8\n  lateral raise     25lb 4×12',
  },
  {
    date: '04/22',
    label: 'upper · pull',
    sets: 20,
    detail: '  barbell row      185lb 4×8\n  lat pulldown     140lb 3×12\n  face pull         50lb 3×15\n  bicep curl        40lb 3×12',
  },
  {
    date: '04/19',
    label: 'lower · legs',
    sets: 24,
    detail: '  barbell squat    215lb 4×6\n  romanian dl      180lb 3×8\n  leg press        350lb 3×12\n  lunges            50lb 3×10',
  },
  {
    date: '04/17',
    label: 'upper · push',
    sets: 22,
    detail: '  bench press      185lb 4×8\n  ohp              115lb 3×8\n  lateral raise     25lb 4×12\n  cable fly         30lb 3×15',
  },
];

const MUSCLES = [
  { name: 'quads', sets: 18 },
  { name: 'hamstrings', sets: 12 },
  { name: 'chest', sets: 16 },
  { name: 'back', sets: 20 },
  { name: 'shoulders', sets: 10 },
  { name: 'biceps', sets: 8 },
  { name: 'triceps', sets: 12 },
];

function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

function barColor(sets: number): string {
  if (sets >= 16) return T.text;
  if (sets >= 10) return T.accent;
  return T.muted;
}

interface Props {
  onChat: () => void;
}

export function DashboardScreen({ onChat }: Props) {
  const { width } = useWindowDimensions();
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showPhotos, setShowPhotos] = useState(false);

  const chartWidth = width - 18 - 26; // nav tab + padding

  return (
    <View style={styles.container}>
      {/* left nav tab */}
      <TouchableOpacity onPress={onChat} style={styles.navTab} activeOpacity={0.7}>
        <Text style={styles.navLabel}>chat</Text>
      </TouchableOpacity>

      <View style={styles.main}>
        {/* logo bar */}
        <View style={styles.logoBar}>
          <MouseLogo size={34} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* muscle volume */}
          <View style={styles.section}>
            <SectionLabel>muscle by volume</SectionLabel>
            {MUSCLES.map((m, i) => (
              <View key={i} style={styles.muscleRow}>
                <Text style={styles.muscleName}>{m.name}</Text>
                <View style={styles.muscleTrack}>
                  <View
                    style={[
                      styles.muscleBar,
                      {
                        width: `${(m.sets / 20) * 100}%`,
                        backgroundColor: barColor(m.sets),
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.muscleSets, { color: barColor(m.sets) }]}>
                  {m.sets}
                </Text>
              </View>
            ))}
            <Text style={styles.muscleTarget}>target 16–20 sets / muscle / week</Text>
          </View>

          {/* weight trend */}
          <View style={styles.section}>
            <SectionLabel>weight trend</SectionLabel>
            <LineChart data={MOCK_WEIGHT} goal={185.0} width={chartWidth} />
          </View>

          {/* past sessions */}
          <View style={styles.section}>
            <SectionLabel>past sessions</SectionLabel>
            {SESSIONS.map((s, i) => (
              <View key={i}>
                <TouchableOpacity
                  onPress={() => setExpanded(expanded === i ? null : i)}
                  style={styles.sessionRow}
                  activeOpacity={0.7}
                >
                  <Text style={styles.sessionDate}>{s.date}</Text>
                  <Text style={styles.sessionLabel}>{s.label}</Text>
                  <Text style={styles.sessionSets}>{s.sets}s</Text>
                  <Text
                    style={[
                      styles.sessionArrow,
                      expanded === i && styles.sessionArrowOpen,
                    ]}
                  >
                    ▸
                  </Text>
                </TouchableOpacity>
                {expanded === i && (
                  <View style={styles.sessionDetail}>
                    <Text style={styles.sessionDetailText}>{s.detail}</Text>
                    <View style={styles.sessionActions}>
                      <TouchableOpacity activeOpacity={0.7}>
                        <Text style={styles.editBtn}>edit session</Text>
                      </TouchableOpacity>
                      <TouchableOpacity activeOpacity={0.7}>
                        <Text style={styles.deleteBtn}>delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* progress photos */}
          <View style={styles.section}>
            <SectionLabel>progress photos</SectionLabel>
            <View style={styles.photoAddRow}>
              <TouchableOpacity style={styles.photoAdd} activeOpacity={0.7}>
                <Text style={styles.photoAddPlus}>+</Text>
              </TouchableOpacity>
              <View>
                <Text style={styles.addPhotoLabel}>add photo</Text>
                <Text style={styles.addPhotoSub}>{'camera or library\n6 photos on file'}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setShowPhotos((v) => !v)}
              style={styles.photoToggle}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.photoToggleArrow,
                  showPhotos && styles.photoToggleArrowOpen,
                ]}
              >
                ▸
              </Text>
              <Text style={styles.photoToggleText}>view history (6 photos)</Text>
            </TouchableOpacity>
            {showPhotos && (
              <View style={styles.photoGrid}>
                {[
                  ['01/15', '190.0'],
                  ['02/01', '189.2'],
                  ['02/15', '188.5'],
                  ['03/01', '188.0'],
                  ['03/15', '187.5'],
                  ['04/01', '187.0'],
                ].map(([d, w], i) => (
                  <TouchableOpacity key={i} style={styles.photoCell} activeOpacity={0.8}>
                    <Text style={styles.photoCellText}>{`${d}\n${w}lb`}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.bg,
    flexDirection: 'row',
  },
  navTab: {
    width: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    color: T.accent,
    fontSize: 7.5,
    letterSpacing: 3,
    fontFamily: FONTS.regular,
    textTransform: 'uppercase',
    transform: [{ rotate: '270deg' }],
    ...T.accentShadow,
  },
  main: {
    flex: 1,
  },
  logoBar: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 13,
    paddingBottom: 32,
    gap: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    color: T.muted,
    fontSize: 8.5,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontFamily: FONTS.regular,
    marginBottom: 11,
  },
  muscleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  muscleName: {
    color: T.muted,
    fontSize: 9,
    fontFamily: FONTS.regular,
    width: 76,
  },
  muscleTrack: {
    flex: 1,
    height: 2.5,
    backgroundColor: T.muted2,
    borderRadius: 2,
  },
  muscleBar: {
    height: '100%',
    borderRadius: 2,
  },
  muscleSets: {
    fontSize: 9,
    fontFamily: FONTS.regular,
    width: 16,
    textAlign: 'right',
  },
  muscleTarget: {
    color: T.muted,
    fontSize: 8.5,
    fontFamily: FONTS.regular,
    marginTop: 8,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 5,
  },
  sessionDate: {
    color: T.muted,
    fontSize: 9,
    fontFamily: FONTS.regular,
    width: 36,
  },
  sessionLabel: {
    color: T.text,
    flex: 1,
    fontSize: 10.5,
    fontFamily: FONTS.regular,
    ...T.textShadow,
  },
  sessionSets: {
    color: T.accent,
    fontSize: 9,
    fontFamily: FONTS.regular,
    ...T.accentShadow,
  },
  sessionArrow: {
    color: T.muted,
    fontSize: 9,
    fontFamily: FONTS.regular,
    marginLeft: 6,
  },
  sessionArrowOpen: {
    transform: [{ rotate: '90deg' }],
  },
  sessionDetail: {
    paddingBottom: 8,
  },
  sessionDetailText: {
    color: T.muted,
    fontSize: 9,
    fontFamily: FONTS.regular,
    lineHeight: 17,
    paddingLeft: 4,
    paddingBottom: 8,
  },
  sessionActions: {
    flexDirection: 'row',
    gap: 14,
  },
  editBtn: {
    color: T.accent,
    fontSize: 9.5,
    fontFamily: FONTS.regular,
    ...T.accentShadow,
  },
  deleteBtn: {
    color: T.muted,
    fontSize: 9.5,
    fontFamily: FONTS.regular,
  },
  photoAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  photoAdd: {
    width: 58,
    height: 74,
    borderWidth: 1,
    borderColor: T.muted,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoAddPlus: {
    color: T.accent,
    fontSize: 22,
    fontFamily: FONTS.regular,
    ...T.accentShadow,
  },
  addPhotoLabel: {
    color: T.accent,
    fontSize: 10,
    fontFamily: FONTS.regular,
    ...T.accentShadow,
  },
  addPhotoSub: {
    color: T.muted,
    fontSize: 9,
    fontFamily: FONTS.regular,
    lineHeight: 17,
  },
  photoToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 10,
  },
  photoToggleArrow: {
    color: T.muted,
    fontSize: 9,
    fontFamily: FONTS.regular,
  },
  photoToggleArrowOpen: {
    transform: [{ rotate: '90deg' }],
  },
  photoToggleText: {
    color: T.muted,
    fontSize: 9.5,
    fontFamily: FONTS.regular,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  photoCell: {
    width: '31%',
    aspectRatio: 3 / 4,
    backgroundColor: T.muted2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoCellText: {
    color: T.muted,
    fontSize: 7.5,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    lineHeight: 13,
  },
});
