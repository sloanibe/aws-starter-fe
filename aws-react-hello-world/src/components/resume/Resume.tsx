import React from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { styled, ThemeProvider } from '@mui/material/styles';
import { resumeTheme } from './theme/resumeTheme';
import { CssBaseline } from '@mui/material';
import {
  SectionHeader,
  ContentSection,
  ResumeHeading,
  ContactBar as StyledContactBar,
  ListItem,
  BulletedList
} from './styles/commonStyles';
import { personalInfo } from './ResumeData/personalInfo';
import profileImage from '../../assets/sloanimage.jpg';
import { education } from './ResumeData/education';
import { certifications } from './ResumeData/certifications';
import { professionalCompetencies } from './ResumeData/skills';
import { summary } from './ResumeData/summary';

// Basic containers with borders to visualize layout
const BackButton = styled('button')(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  left: theme.spacing(2),
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  color: theme.palette.grey[700],
  padding: theme.spacing(1),
  borderRadius: '4px',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)'
  }
}));

// Outer wrapper that establishes a new stacking context to prevent styles from leaking
const ResumeWrapper = styled('div')(({ theme }) => ({  // Outer wrapper for centering
  width: '100%',
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(2.5, 0),
  isolation: 'isolate', // Creates a new stacking context
  overflow: 'auto' // Enable scrolling
}));

const ResumeContainer = styled('div')({  // Main container
  width: '100%',
  maxWidth: '1200px',
  margin: '0 20px',
  backgroundColor: '#ffffff',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  position: 'relative',
  height: 'fit-content' // Allow container to grow with content
});

const ResumeDocument = styled('div')(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  padding: '0 40px 40px',
  gap: 0, // Remove gap between sections
  margin: '0 auto',
  maxWidth: '1000px',
  backgroundColor: theme.palette.background.default
}));

const TopBanner = styled('div')(({ theme }) => ({
  width: '100%',
  height: theme.spacing(2),
  backgroundColor: theme.palette.primary.main,
  marginBottom: 0 // Remove gap between banner and name section
}));

const ProfileImage = styled('img')(({ theme }) => ({
  width: '90px',
  height: '90px',
  borderRadius: '50%',
  objectFit: 'cover',
  border: '2px solid #e0e0e0',
  marginRight: theme.spacing(3)
}));

const NameWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  position: 'relative',
  minHeight: '90px',
  '& h1': {
    width: '100%',
    textAlign: 'center',
    paddingLeft: '90px',
    paddingRight: '90px',
    fontSize: '2.5rem' // Increase name font size
  },
  '& img': {
    position: 'absolute',
    left: 0
  }
}));

const NameSection = styled('div')(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  backgroundColor: theme.palette.grey[100],
  padding: theme.spacing(2),
  paddingBottom: theme.spacing(3),
  borderBottom: `1px solid ${theme.palette.grey[300]}`,
  '& h1': {
    margin: 0
  }
}));

const Header = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  marginBottom: 0
}));

const ContactInfo = styled(StyledContactBar)(({ theme }) => ({
  width: '100%',
  marginTop: 'auto'
}));

const TwoColumnSection = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(4),
  marginTop: 0,
  marginBottom: 0
}));

const SingleColumnSection = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  width: '100%'
}));

const LeftColumn = styled('div')(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  minWidth: '250px',
  backgroundColor: theme.palette.grey[800], // Darker grey to match Word document
  color: '#ffffff',
  padding: theme.spacing(0, 2, 2, 2), // Remove top padding to touch contact section
  '& > div': {
    backgroundColor: 'transparent'
  },
  '& .MuiSectionHeader': {
    color: '#ffffff',
    backgroundColor: 'transparent',
    borderBottom: '2px solid #ffffff',
    padding: theme.spacing(1, 0),
    marginBottom: theme.spacing(2)
  },
  '& .MuiListItem': {
    color: '#ffffff'
  }
}));

const RightColumn = styled('div')(({ theme }) => ({
  flex: 2,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  '& .MuiSectionHeader': {
    color: theme.palette.grey[500],
    borderBottom: `2px solid ${theme.palette.grey[500]}`
  }
}));

const Section = styled(ContentSection)(({ theme }) => ({
  '& + &': {
    marginTop: theme.spacing(2)
  }
}));

const Resume: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/dashboard');
  };
  return (
    <ThemeProvider theme={resumeTheme}>
      <CssBaseline />
      <ResumeWrapper>
        <ResumeContainer>
        <BackButton onClick={handleBack}>
          <ArrowBackIcon />
          Back
        </BackButton>
        <ResumeDocument>
      <Header>
        <TopBanner />
        <NameSection>
          <NameWrapper>
            <ProfileImage src={profileImage} alt="Profile" />
            <ResumeHeading>{personalInfo.name}</ResumeHeading>
          </NameWrapper>
        </NameSection>
        <ContactInfo>
          <div>{personalInfo.contactInfo.location}</div>
          <div>{personalInfo.contactInfo.phone}</div>
          <div>{personalInfo.contactInfo.email}</div>
          <div>{personalInfo.contactInfo.linkedIn}</div>
          {personalInfo.contactInfo.relocate && <div>Willing to relocate</div>}
        </ContactInfo>
      </Header>

      <TwoColumnSection>
        <LeftColumn>
          <Section>
            <SectionHeader>EDUCATION</SectionHeader>
            {education.map((edu, index) => (
              <div key={index}>
                <div>{edu.degree}</div>
                <div>{edu.institution}</div>
                <div>{edu.location}</div>
              </div>
            ))}
          </Section>

          <Section>
            <SectionHeader>CERTIFICATIONS & TRAINING</SectionHeader>
            {certifications.map((cert, index) => (
              <div key={index}>
                <div>{cert.name}</div>
                {cert.issuer && <div>{cert.issuer}</div>}
                {cert.dateAchieved && <div>{cert.dateAchieved}</div>}
              </div>
            ))}
          </Section>

          <Section>
            <SectionHeader>PROFESSIONAL COMPETENCIES</SectionHeader>
            <BulletedList>
              {professionalCompetencies.map((skill, index) => (
                <ListItem key={index}>{skill}</ListItem>
              ))}
            </BulletedList>
          </Section>

          <Section>
            <SectionHeader>REFERENCES</SectionHeader>
            <div>References available upon request</div>
          </Section>
        </LeftColumn>

        <RightColumn>
          <Section>
            <SectionHeader>SENIOR SOFTWARE ENGINEER/FULL STACK DEVELOPER</SectionHeader>
            <div style={{ whiteSpace: 'pre-wrap' }}>{summary.content}</div>
          </Section>

          <Section>
            <SectionHeader>PROFESSIONAL EXPERIENCE</SectionHeader>
            <div>Contractor UCSB experience here</div>
          </Section>
        </RightColumn>
      </TwoColumnSection>

      <SingleColumnSection>
        <Section>
          <SectionHeader>PROFESSIONAL EXPERIENCE (continued)</SectionHeader>
          <div>Additional professional experiences here</div>
        </Section>

        <Section>
          <SectionHeader>ADDITIONAL EXPERIENCE</SectionHeader>
          <div>Additional experience content here</div>
        </Section>

        <Section>
          <SectionHeader>TECHNICAL SKILLS</SectionHeader>
          <div>Technical skills content here</div>
        </Section>
      </SingleColumnSection>
        </ResumeDocument>
      </ResumeContainer>
    </ResumeWrapper>
    </ThemeProvider>
  );
};

export default Resume;
