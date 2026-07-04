import React from 'react';
import { Typography } from './Typography';

export default {
  title: 'Atoms/Typography',
  component: Typography,
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'body', 'body-sm', 'caption'],
    },
    weight: {
      control: { type: 'select' },
      options: ['regular', 'medium', 'semibold', 'bold'],
    },
    color: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'error', 'brand'],
    },
  },
};

const Template = (args) => <Typography {...args} />;

export const Headers = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
    <Typography variant="h1">Header 1</Typography>
    <Typography variant="h2">Header 2</Typography>
    <Typography variant="h3">Header 3</Typography>
    <Typography variant="h4">Header 4</Typography>
    <Typography variant="h5">Header 5</Typography>
    <Typography variant="h6">Header 6</Typography>
  </div>
);

export const Body = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
    <Typography variant="body">Body text. Lorem ipsum dolor sit amet.</Typography>
    <Typography variant="body-sm">Small body text. Lorem ipsum dolor sit amet.</Typography>
    <Typography variant="caption">Caption text. Lorem ipsum dolor sit amet.</Typography>
  </div>
);
