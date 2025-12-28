/**
 * メニューカードコンポーネント
 */
import { Card, CardContent, CardMedia, Typography, Chip, Box } from '@mui/material';
import { MenuItem } from '../types/menu';

interface MenuCardProps {
  menu: MenuItem;
  onClick?: () => void;
}

export function MenuCard({ menu, onClick }: MenuCardProps) {
  const imageUrl = menu.thumbnail_url || menu.image_urls[0] || '/placeholder.jpg';
  const restaurant = menu.restaurants[0];
  const parkLabel = restaurant?.park === 'tdl' ? 'ランド' : 'シー';

  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: 3,
        } : {},
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={imageUrl}
        alt={menu.name}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="h2" noWrap>
          {menu.name}
        </Typography>

        <Typography variant="h5" color="primary" gutterBottom>
          ¥{menu.price.amount.toLocaleString()}
          {menu.price.unit && (
            <Typography component="span" variant="body2" color="text.secondary" ml={1}>
              {menu.price.unit}
            </Typography>
          )}
        </Typography>

        {restaurant && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {restaurant.name} ({parkLabel})
          </Typography>
        )}

        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {menu.is_seasonal && (
            <Chip label="季節限定" size="small" color="secondary" />
          )}
          {menu.is_new && (
            <Chip label="新商品" size="small" color="success" />
          )}
          {menu.tags.slice(0, 2).map((tag) => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
