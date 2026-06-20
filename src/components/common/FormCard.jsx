import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const FormCard = ({ title, children, ...props }) => {
  return (
    <Card 
      variant="outlined" 
      sx={{ 
        borderRadius: '16px', 
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow-sm)',
        mb: 3,
        overflow: 'visible'
      }} 
      {...props}
    >
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        {title && (
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700, 
              color: 'var(--dark)', 
              mb: 2.5,
              fontSize: '1.05rem',
              borderBottom: '1px solid var(--border)',
              pb: 1
            }}
          >
            {title}
          </Typography>
        )}
        {children}
      </CardContent>
    </Card>
  );
};

export default FormCard;
