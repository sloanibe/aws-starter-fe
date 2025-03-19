import React, { forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { styled, ThemeProvider } from '@mui/material/styles';
import { resumeTheme } from './theme/resumeTheme';
import { CssBaseline, List, ListItem as MuiListItem, Link } from '@mui/material';
import {
  SectionHeader,
  ContentSection,
  ResumeHeading,
  ContactBar as StyledContactBar
} from './styles/commonStyles';
import { personalInfo } from './ResumeData/personalInfo';
import profileImage from '../../assets/sloanimage.jpg';
import { education } from './ResumeData/education';
import { certifications } from './ResumeData/certifications';
import { professionalCompetencies } from './ResumeData/professionalCompetencies';
import { summary } from './ResumeData/summary';
import { professionalExperience } from './ResumeData/experience';

// Basic containers with borders to visualize layout


const BackButton = styled('button')(({ theme }) => ({
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  color: theme.palette.grey[700],
  padding: theme.spacing(1),
  borderRadius: '4px',
  position: 'absolute',
  top: theme.spacing(1),
  left: theme.spacing(2),
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)'
  },
  '@media print': {
    display: 'none'
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
  padding: `${Number(theme.spacing(5).toString().replace('px', '')) + 25}px 0 ${theme.spacing(2.5)}`, // Add top padding to account for header
  isolation: 'isolate', // Creates a new stacking context
  overflow: 'auto', // Enable scrolling
  '@media print': {
    padding: theme.spacing(2.5, 0) // Reset padding for print
  }
}));

const ResumeContainer = styled('div')(({ theme }) => ({  // Main container
  width: '100%',
  maxWidth: '1200px',
  margin: `0 ${theme.spacing(2.5)}`,
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  position: 'relative',
  height: 'fit-content' // Allow container to grow with content
}));

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
  backgroundColor: theme.palette.primary.main, // Same as ContactBar
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
  marginTop: theme.spacing(2),
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
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(3),
  borderBottom: `1px solid ${theme.palette.grey[300]}`,
  '& h1': {
    margin: 0
  }
}));

const ResumeHeader = styled('div')(({ theme }) => ({
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

const RightColumnHeader = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.grey[800],
  padding: theme.spacing(1, 2),
  '& .MuiSectionHeader': {
    color: '#ffffff',
    borderBottom: '2px solid #ffffff'
  }
}));

const RightColumn = styled('div')(({ theme }) => ({
  flex: 2,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  '& .MuiSectionHeader': {
    color: theme.palette.grey[500],
    borderBottom: `2px solid ${theme.palette.grey[500]}`
  },
  '& .MuiList-root': {
    marginTop: '0.5rem',
    '& .MuiListItem-root': {
      fontSize: '0.9rem',
      lineHeight: 1.5,
      marginBottom: '0.5rem',
      paddingLeft: '1.5rem',
      position: 'relative'
    }
  }
}));

const Section = styled(ContentSection)(({ theme }) => ({
  '& + &': {
    marginTop: theme.spacing(2)
  }
}));

const Resume = forwardRef<HTMLDivElement>((props, ref) => {
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
        <ResumeDocument ref={ref} id="resume-content">
      <ResumeHeader>
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
          <div>
            <Link
              href={`mailto:${personalInfo.contactInfo.email}`}
              color="inherit"
              underline="hover"
              component="a"
            >
              {personalInfo.contactInfo.email}
            </Link>
          </div>
          <div>
            <Link
              href={personalInfo.contactInfo.linkedIn.url.startsWith('http') ? personalInfo.contactInfo.linkedIn.url : `https://${personalInfo.contactInfo.linkedIn.url}`}
              target="_blank"
              rel="noopener noreferrer"
              color="inherit"
              underline="hover"
              component="a"
            >
              {personalInfo.contactInfo.linkedIn.text}
            </Link>
          </div>
          {personalInfo.contactInfo.relocate && <div>Willing to relocate</div>}
        </ContactInfo>
      </ResumeHeader>

      <TwoColumnSection>
        <LeftColumn>
          <Section>
            <SectionHeader>EDUCATION</SectionHeader>
            {education.map((edu, index) => (
              <div key={index}>
                <div>{edu.degree}</div>
                <div>{edu.institution}</div>
                <div>{edu.location}</div>
                {edu.diplomaPath && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <Link
                      href={edu.diplomaPath}
                      download="CalPoly_CS_Diploma.pdf"
                      rel="noopener"
                      component="a"
                      sx={{ 
                        color: '#90caf9',
                        textDecoration: 'underline',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        cursor: 'pointer'
                      }}
                    >
                      eDiploma
                    </Link>
                  </div>
                )}
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
            <List sx={{
              '& .MuiListItem-root': {
                fontSize: '0.85rem',
                lineHeight: 1.3,
                marginBottom: '0.2rem',
                paddingTop: '0.1rem',
                paddingBottom: '0.1rem',
                minHeight: 'unset'
              }
            }}>
              {professionalCompetencies.map((skill, index) => (
                <MuiListItem key={index}>{skill}</MuiListItem>
              ))}
            </List>
          </Section>

          <Section>
            <SectionHeader>REFERENCES</SectionHeader>
            <div>References available upon request</div>
          </Section>
        </LeftColumn>

        <RightColumn>
          <RightColumnHeader>
            <SectionHeader style={{ marginBottom: 0 }}>SENIOR SOFTWARE ENGINEER/FULL STACK DEVELOPER</SectionHeader>
          </RightColumnHeader>
          <Section style={{ paddingTop: 0 }}>
            <div style={{ whiteSpace: 'pre-wrap' }}>{summary.content}</div>
          </Section>

          <RightColumnHeader>
            <SectionHeader style={{ marginBottom: 0 }}>PROFESSIONAL EXPERIENCE</SectionHeader>
          </RightColumnHeader>
          <Section style={{ paddingTop: 0 }}>
            {professionalExperience.map((exp, index: number) => (
              <div key={index}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>{exp.title}</strong> - {exp.company}
                  <div>{exp.location}</div>
                  <div>{exp.startDate} - {exp.endDate || 'Present'}</div>
                </div>
                <List>
                  {exp.responsibilities.map((resp: string, i: number) => (
                    <MuiListItem key={i}>{resp}</MuiListItem>
                  ))}
                </List>
              </div>
            ))}
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
});

export default Resume;
