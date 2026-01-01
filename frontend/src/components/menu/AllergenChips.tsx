import { Chip, Stack } from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

interface AllergenChipsProps {
  allergens: string[];
  size?: 'small' | 'medium';
}

export function AllergenChips({ allergens, size = 'small' }: AllergenChipsProps) {
  if (allergens.length === 0) {
    return null;
  }

  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap">
      {allergens.map((allergen) => (
        <Chip
          key={allergen}
          icon={<WarningIcon />}
          label={allergen}
          size={size}
          color="warning"
          variant="filled"
        />
      ))}
    </Stack>
  );
}
