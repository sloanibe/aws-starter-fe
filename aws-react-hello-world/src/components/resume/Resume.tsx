import React, { forwardRef, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { styled, ThemeProvider } from '@mui/material/styles';
import { resumeTheme } from './theme/resumeTheme';
import { CssBaseline, List, ListItem as MuiListItem, Link, Button } from '@mui/material';
import { usePDF } from 'react-to-pdf';
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
import { professionalExperience, Experience } from './ResumeData/experience';
import { additionalExperience } from './ResumeData/additionalExperience';
import { technicalSkills } from './ResumeData/technicalSkills';
import { summary } from './ResumeData/summary';

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




const Spacer = styled('div')<{ height: string }>(({ height }) => ({
  height: 0,
  width: '100%',
  '@media print': {
    height
  }
}));

const ExperienceEntry = styled('div')(() => ({
  display: 'block',
  marginBottom: '2rem',
  '& + &': {
    marginTop: '2rem'
  }
}));

const ExperienceWrapper = styled('div')(() => ({
  display: 'block',
  breakInside: 'avoid',
  pageBreakInside: 'avoid'
}));

const Page = styled('div')(() => ({
  width: '8.5in',
  height: '11in',
  padding: '0.5in',
  pageBreakAfter: 'always',
  overflow: 'hidden',
  position: 'relative',
  backgroundColor: '#fff'
}));

const ResumeDocument = styled('div')(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
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
  width: '120px',
  height: '120px',
  borderRadius: '50%',
  objectFit: 'cover',
  border: '2px solid #e0e0e0',
  marginRight: theme.spacing(2)
}));

const NameWrapper = styled('div')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  minHeight: '120px',
  marginTop: theme.spacing(1),
  '& h1': {
    textAlign: 'left',
    fontSize: '2.5rem' // Increase name font size
  },
  '& img': {
    marginRight: '20px'
  }
}));

const NameSection = styled('div')(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  backgroundColor: theme.palette.grey[100],
  padding: theme.spacing(2),
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.grey[300]}`,
  '& h1': {
    margin: 0
  }
}));

const ResumeHeader = styled('div')(() => ({
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

const TechnicalSkillsSection = styled('div')(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& > div': {
    marginBottom: theme.spacing(1)
  }
}));

const AdditionalExperienceItem = styled('div')(({ theme }) => ({
  marginBottom: theme.spacing(2),
  breakInside: 'avoid',
  pageBreakInside: 'avoid'
}));

const SummarySection = styled('div')(({ theme }) => ({
  width: '100%',
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  '& ul': {
    paddingLeft: theme.spacing(2),
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  '& li': {
    marginBottom: theme.spacing(0.5)
  }
}));

const SummaryTitle = styled('div')(({ theme }) => ({
  width: '100%',
  textAlign: 'center',
  fontWeight: 'bold',
  fontSize: '1.2rem',
  marginBottom: theme.spacing(2),
  textTransform: 'uppercase'
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

const Section = styled(ContentSection)(() => ({
  '& + &': {
    marginTop: '16px'
  }
}));

const Resume = forwardRef<HTMLDivElement>((props, ref) => {
  const navigate = useNavigate();
  const { toPDF, targetRef } = usePDF({
    filename: 'resume.pdf',
    method: 'save',
    page: {
      format: [8.5, 11],
      orientation: 'portrait',
      margin: 36 // 0.5 inch in points
    }
  });

  const handleBack = () => {
    navigate('/dashboard');
  };
  return (
    <ThemeProvider theme={resumeTheme}>
      <CssBaseline />
      <Button onClick={() => toPDF()} style={{ margin: '1rem' }}>
        Download PDF
      </Button>
      <ResumeWrapper>
        <ResumeContainer ref={targetRef}>
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
            
            <SummarySection>
              <SummaryTitle>SENIOR SOFTWARE ENGINEER/FULL STACK DEVELOPER</SummaryTitle>
              <div dangerouslySetInnerHTML={{ __html: summary.content.replace(/\n\n• /g, '<br/>• ').replace(/\n\n/g, '<br/><br/>') }} />
            </SummarySection>

            <TwoColumnSection>
              <LeftColumn>
                <Section>
                  <SectionHeader>EDUCATION</SectionHeader>
                  {education.map((edu, index) => (
                    <div key={index} style={{ marginBottom: '1rem' }}>
                      <strong>{edu.degree}</strong>
                      <div>{edu.institution} - {edu.location}</div>
                    </div>
                  ))}
                </Section>

                <Section>
                  <SectionHeader>CERTIFICATIONS</SectionHeader>
                  {certifications.map((cert, index) => (
                    <div key={index} style={{ marginBottom: '1rem' }}>
                      <strong>{cert.name}</strong>
                      <div>{cert.issuer}</div>
                      <div>{cert.date}</div>
                    </div>
                  ))}
                </Section>

                <Section>
                  <SectionHeader>PROFESSIONAL COMPETENCIES</SectionHeader>
                  <List>
                    {professionalCompetencies.map((comp, index) => (
                      <MuiListItem key={index}>{comp}</MuiListItem>
                    ))}
                  </List>
                </Section>
              </LeftColumn>

              <RightColumn>
                <RightColumnHeader>
                  <SectionHeader style={{ marginBottom: 0 }}>PROFESSIONAL EXPERIENCE</SectionHeader>
                </RightColumnHeader>
                <Section style={{ paddingTop: 0 }}>
                  {professionalExperience.map((exp, index: number) => (
                    <React.Fragment key={index}>
                      {exp.company === 'Vinfolio' && <Spacer height="400px" />}
                      <ExperienceWrapper>
                        <ExperienceEntry>
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
                        </ExperienceEntry>
                      </ExperienceWrapper>
                    </React.Fragment>
                  ))}
                </Section>

                <RightColumnHeader>
                  <SectionHeader style={{ marginBottom: 0 }}>ADDITIONAL EXPERIENCE</SectionHeader>
                </RightColumnHeader>
                <Section style={{ paddingTop: 0 }}>
                  {additionalExperience.map((exp, index) => (
                    <AdditionalExperienceItem key={index}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <strong>{exp.title}</strong>
                          <div>{exp.company} - {exp.location}</div>
                        </div>
                        <div style={{ whiteSpace: 'nowrap' }}>
                          {exp.startDate} - {exp.endDate}
                        </div>
                      </div>
                    </AdditionalExperienceItem>
                  ))}
                </Section>
              </RightColumn>
            </TwoColumnSection>

            <div style={{ marginTop: '20px' }}>
              <RightColumnHeader style={{ marginBottom: '15px' }}>
                <SectionHeader style={{ marginBottom: 0 }}>TECHNICAL SKILLS</SectionHeader>
              </RightColumnHeader>
              <Section style={{ paddingTop: 0 }}>
                <TechnicalSkillsSection>
                  {technicalSkills.map((category, index) => (
                    <div key={index}>
                      <strong>{category.category}:</strong>{' '}
                      {category.skills.join(' | ')}
                    </div>
                  ))}
                </TechnicalSkillsSection>
              </Section>
            </div>
          </ResumeDocument>
        </ResumeContainer>
      </ResumeWrapper>
    </ThemeProvider>
  );
});

export default Resume;
