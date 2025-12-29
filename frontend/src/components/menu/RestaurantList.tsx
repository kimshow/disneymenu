import { useState } from 'react';
import {
  Box,
  Typography,
  Collapse,
  IconButton,
  Divider,
  Stack,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import type { Restaurant } from '../../types/menu';
import { RestaurantItem } from './RestaurantItem';

interface RestaurantListProps {
  restaurants: Restaurant[];
}

export function RestaurantList({ restaurants }: RestaurantListProps) {
  const [expanded, setExpanded] = useState(false);

  if (restaurants.length === 0) {
    return null;
  }

  // 1店舗のみの場合は折りたたみなし
  if (restaurants.length === 1) {
    return <RestaurantItem restaurant={restaurants[0]} />;
  }

  // 複数店舗の場合は折りたたみ表示
  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        onClick={() => setExpanded(!expanded)}
        sx={{ cursor: 'pointer', py: 1 }}
      >
        <Typography variant="body2" color="text.secondary">
          販売場所 ({restaurants.length}店舗)
        </Typography>
        <IconButton size="small">
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Stack>

      <Collapse in={expanded}>
        <Box sx={{ pl: 2 }}>
          {restaurants.map((restaurant, index) => (
            <Box key={restaurant.id}>
              <RestaurantItem restaurant={restaurant} />
              {index < restaurants.length - 1 && <Divider sx={{ my: 1 }} />}
            </Box>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}
