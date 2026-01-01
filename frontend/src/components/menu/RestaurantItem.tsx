import { Box, Typography, Chip, Stack } from '@mui/material';
import { Restaurant as RestaurantIcon, RoomService as ServiceIcon } from '@mui/icons-material';
import type { Restaurant } from '../../types/menu';

interface RestaurantItemProps {
  restaurant: Restaurant;
}

export function RestaurantItem({ restaurant }: RestaurantItemProps) {
  const parkLabel = restaurant.park === 'tdl' ? 'ランド' : 'シー';

  return (
    <Box sx={{ py: 1 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <RestaurantIcon fontSize="small" color="action" />
        <Typography variant="body2" fontWeight="medium">
          {restaurant.name}
        </Typography>
      </Stack>

      <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }} flexWrap="wrap">
        <Chip label={parkLabel} size="small" variant="outlined" />
        <Chip label={restaurant.area} size="small" variant="outlined" />
        {restaurant.service_types?.map((type) => (
          <Chip
            key={type}
            icon={<ServiceIcon />}
            label={type}
            size="small"
            color="primary"
            variant="outlined"
          />
        ))}
      </Stack>
    </Box>
  );
}
