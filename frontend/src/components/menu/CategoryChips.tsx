import { Chip, Stack } from '@mui/material';
import { Category as CategoryIcon } from '@mui/icons-material';

interface CategoryChipsProps {
  categories: string[];
  size?: 'small' | 'medium';
}

export function CategoryChips({ categories, size = 'small' }: CategoryChipsProps) {
  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap">
      {categories.map((category) => (
        <Chip
          key={category}
          icon={<CategoryIcon />}
          label={category}
          size={size}
          color="default"
          variant="outlined"
        />
      ))}
    </Stack>
  );
}
