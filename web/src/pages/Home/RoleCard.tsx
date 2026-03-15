/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Reusable card component for role-selection on the Home page.
 *   Renders an icon, title, and description inside a clickable MUI Card.
 */
import React from 'react';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export interface RoleCardProps {
  /** Icon element displayed at the start of the card header. */
  icon: React.ReactNode;
  /** Card title shown next to the icon. */
  title: string;
  /** Short description rendered below the title. */
  description: string;
  /** Called when the card is clicked. */
  onClick: () => void;
}

/** Role-selection card with icon, title, and description. */
export function RoleCard({ icon, title, description, onClick }: RoleCardProps) {
  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: 3,
        transition: '0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
      }}
    >
      <CardActionArea onClick={onClick}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={1}>
            <Box mr={2} fontSize={32}>
              {icon}
            </Box>
            <Typography variant="h6">{title}</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
