import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Fonts, radius, space, Type, useTheme, useThemedStyles } from '../theme';
import type { Palette } from '../theme';
import { Chip } from './Chip';

type TagInputProps = {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
};

// Free-text tag entry: type + Enter to add, tap × to remove.
// Used for disliked ingredients and pantry staples.
export function TagInput({ value, onChange, placeholder }: TagInputProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [draft, setDraft] = useState('');

  const add = () => {
    const clean = draft.trim().toLowerCase();
    if (!clean) return;
    if (!value.includes(clean)) onChange([...value, clean]);
    setDraft('');
  };

  const remove = (tag: string) => onChange(value.filter((t) => t !== tag));

  return (
    <View>
      <TextInput
        value={draft}
        onChangeText={setDraft}
        onSubmitEditing={add}
        onBlur={add}
        placeholder={placeholder}
        placeholderTextColor={colors.faint}
        style={styles.input}
        autoCapitalize="none"
        returnKeyType="done"
        blurOnSubmit={false}
      />
      {value.length > 0 ? (
        <View style={styles.chips}>
          {value.map((tag) => (
            <Chip key={tag} label={tag} onRemove={() => remove(tag)} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    input: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.md,
      backgroundColor: c.surface,
      paddingVertical: 14,
      paddingHorizontal: space.lg,
      fontFamily: Fonts.body,
      ...Type.body,
      color: c.ink,
    },
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: space.sm,
      marginTop: space.md,
    },
  });
