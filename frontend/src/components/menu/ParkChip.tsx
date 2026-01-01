import { Chip } from '@mui/material';
import { Park as ParkIcon } from '@mui/icons-material';

interface ParkChipProps {
  park: 'tdl' | 'tds';
  size?: 'small' | 'medium';
}

export function ParkChip({ park, size = 'small' }: ParkChipProps) {
  const label = park === 'tdl' ? 'ランド' : 'シー';
  const color = park === 'tdl' ? 'primary' : 'secondary';

  return (
    <Chip
      icon={<ParkIcon />}
      label={label}
      size={size}
      color={color}
      variant="outlined"
    />
  );
}
