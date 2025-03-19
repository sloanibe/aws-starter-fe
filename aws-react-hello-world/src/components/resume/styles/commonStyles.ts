import { styled } from '@mui/material/styles';

export const SectionHeader = styled('h3')(({ theme }) => ({
  ...theme.typography.h3,
  backgroundColor: 'transparent',
  color: theme.palette.text.secondary,
  padding: theme.spacing(1, 2),
  margin: 0,
  marginBottom: theme.spacing(2),
  borderBottom: '1px solid currentColor'
}));

export const ContentSection = styled('div')(({ theme }) => ({
  padding: theme.spacing(2),
  '& + &': {
    marginTop: theme.spacing(2),
  }
}));

export const ResumeHeading = styled('h1')(({ theme }) => ({
  ...theme.typography.h1,
  color: theme.palette.text.primary,
  margin: theme.spacing(2, 0),
}));

export const ContactBar = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(1, 2),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.text.primary,
  fontSize: '0.9rem',
  fontWeight: 400,
  '& > *': {
    display: 'inline-flex',
    alignItems: 'center',
    '&:not(:last-child)::after': {
      content: '"│"',
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(2),
      color: theme.palette.grey[500],
    }
  }
}));

export const ListItem = styled('div')(({ theme }) => ({
  ...theme.typography.body1,
  padding: theme.spacing(0.25, 0), // Reduced vertical padding
  lineHeight: 1.2, // Tighter line height
}));

export const BulletedList = styled('div')(({ theme }) => ({
  '& > *': {
    position: 'relative',
    paddingLeft: theme.spacing(3),
    '&::before': {
      content: '"•"',
      position: 'absolute',
      left: theme.spacing(1),
    }
  }
}));
