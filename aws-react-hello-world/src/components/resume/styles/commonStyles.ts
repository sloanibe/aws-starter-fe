import { styled } from '@mui/material/styles';

export const SectionHeader = styled('h3')(({ theme }) => ({
  ...theme.typography.h3,
  backgroundColor: 'transparent',
  color: theme.palette.text.secondary,
  padding: theme.spacing(0.25, 2), // Reduced vertical padding
  margin: 0,
  marginBottom: theme.spacing(0.5), // Reduced bottom margin
  borderBottom: '1px solid currentColor',
  '@media print': {
    padding: theme.spacing(0.25, 1),
    marginBottom: theme.spacing(0.5),
    fontSize: '12px',
    lineHeight: 1.2
  }
}));

export const ContentSection = styled('div')(({ theme }) => ({
  padding: theme.spacing(0.5), // Reduced padding
  '& + &': {
    marginTop: theme.spacing(0.75), // Reduced margin between sections
  },
  '@media print': {
    padding: theme.spacing(0.5),
    '& + &': {
      marginTop: theme.spacing(0.5),
    },
    pageBreakInside: 'avoid',
    breakInside: 'avoid'
  }
}));

export const ResumeHeading = styled('h1')(({ theme }) => ({
  ...theme.typography.h1,
  color: theme.palette.text.primary,
  margin: theme.spacing(1, 0),
  textAlign: 'left',
  '@media print': {
    fontSize: '22px',
    marginBottom: '8px'
  }
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
  },
  '@media print': {
    backgroundColor: `${theme.palette.primary.main} !important`,
    WebkitPrintColorAdjust: 'exact',
    printColorAdjust: 'exact',
    fontSize: '10px',
    padding: theme.spacing(0.5, 1)
  }
}));

export const ListItem = styled('div')(({ theme }) => ({
  ...theme.typography.body1,
  padding: 0,
  lineHeight: 1.2, // Slightly increased line height
  marginBottom: '1px', // Minimal space between items
  fontSize: '1rem', // Increased font size for web view
  '@media print': {
    fontSize: '9px',
    lineHeight: 1.2
  }
}));

export const BulletedList = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(0.1), // Reduced top margin
  '& > *': {
    position: 'relative',
    paddingLeft: theme.spacing(1.75), // Reduced left padding
    marginBottom: '1px', // Minimal space between items
    '&::before': {
      content: '"•"',
      position: 'absolute',
      left: theme.spacing(0.5),
    }
  },
  '@media print': {
    marginTop: 0,
    '& > *': {
      pageBreakInside: 'avoid',
      breakInside: 'avoid',
      paddingLeft: theme.spacing(1.5),
      marginBottom: '1px',
      '&::before': {
        left: theme.spacing(0.25),
      }
    }
  }
}));
