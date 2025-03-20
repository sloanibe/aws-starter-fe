---
title: "Resume Component Technical Documentation"
category: "frontend-development"
order: 10
tags: ["resume", "react", "pdf-generation", "material-ui", "styled-components", "responsive-design"]
---

# Resume Component Technical Documentation

## Overview

The Resume Component is a sophisticated React-based system for creating, displaying, and exporting professional resumes. It features a responsive two-column layout, modular data architecture, and advanced PDF generation capabilities. This component demonstrates modern React development practices including component composition, styled-components with Material UI, and data-driven rendering.

## Architecture

### Component Structure

The Resume component follows a modular architecture with clear separation of concerns:

```
/components/resume/
├── Resume.tsx                # Main component
├── ResumeData/               # Data modules
│   ├── experience.ts         # Professional experience data
│   ├── education.ts          # Education history
│   ├── certifications.ts     # Professional certifications
│   ├── personalInfo.ts       # Contact and personal details
│   ├── professionalCompetencies.ts # Core competencies
│   ├── technicalSkills.ts    # Technical skills by category
│   ├── additionalExperience.ts # Secondary work experience
│   └── summary.ts            # Professional summary
├── styles/                   # Shared styles
│   └── commonStyles.ts       # Reusable styled components
└── theme/                    # Theming
    └── resumeTheme.ts        # MUI theme customization
```

### Component Hierarchy

The Resume component uses a nested component structure to create a professional, printable resume:

```
Resume (Main Component)
├── ThemeProvider (MUI Theme Context)
│   ├── CssBaseline (Reset CSS)
│   ├── Button (PDF Download)
│   └── ResumeWrapper (Outer Container)
│       └── ResumeContainer (Main Container)
│           ├── BackButton (Navigation)
│           └── ResumeDocument (Content Container)
│               ├── ResumeHeader (Top Section)
│               │   ├── TopBanner (Colored Banner)
│               │   ├── NameSection (Profile)
│               │   │   └── NameWrapper (Name and Image)
│               │   └── ContactInfo (Contact Details)
│               ├── SummarySection (Professional Summary)
│               ├── TwoColumnSection (Main Content)
│               │   ├── LeftColumn (Sidebar)
│               │   │   ├── Section (Education)
│               │   │   ├── Section (Certifications)
│               │   │   └── Section (Professional Competencies)
│               │   └── RightColumn (Main Content)
│               │       ├── Section (Professional Experience)
│               │       │   └── ExperienceEntry (Job Details)
│               │       └── Section (Additional Experience)
│               └── Section (Technical Skills)
```

### Data Architecture

The Resume component implements a strict separation between data and presentation through a modular data architecture:

#### Data Models

Each section of the resume has its own strongly-typed data model:

1. **Personal Information** (`personalInfo.ts`):
   ```typescript
   interface PersonalInfo {
     name: string;
     contactInfo: {
       location: string;
       phone: string;
       email: string;
       linkedIn: { text: string; url: string };
       relocate: boolean;
     };
   }
   ```

2. **Experience** (`experience.ts`):
   ```typescript
   interface Experience {
     title: string;
     company: string;
     location: string;
     startDate: string;
     endDate?: string;
     responsibilities: string[];
   }
   ```

3. **Technical Skills** (`technicalSkills.ts`):
   ```typescript
   interface SkillCategory {
     category: string;
     skills: string[];
   }
   ```

4. **Education** (`education.ts`):
   ```typescript
   interface Education {
     degree: string;
     institution: string;
     location: string;
     graduationDate?: string;
   }
   ```

5. **Certifications** (`certifications.ts`):
   ```typescript
   interface Certification {
     name: string;
     issuer: string;
     date: string;
   }
   ```

### Data Flow

The Resume component uses a unidirectional data flow pattern:

1. **Data Definition**: Data is defined in TypeScript files within the `ResumeData` directory, each with its own interface ensuring type safety
2. **Data Import**: The main `Resume` component imports all data modules at the top of the file
3. **Data Rendering**: Data is passed to specialized rendering components through props or direct access
4. **Conditional Rendering**: Some sections implement conditional rendering based on data properties
5. **PDF Capture**: The rendered DOM structure is captured for PDF export via the `react-to-pdf` library

## Component Composition and Data Flow

### Component Hierarchy

The Resume component is composed of several child components, each responsible for rendering a specific section of the resume. Here's a breakdown of the key components and their responsibilities:

1. **ResumeWrapper & ResumeContainer**
   - Outer containers that establish the layout and positioning
   - Handle scrolling behavior and provide proper spacing
   - Apply print-specific styling through media queries
   - `ResumeContainer` receives the `targetRef` for PDF generation

2. **ResumeDocument**
   - Main content container that holds all resume sections
   - Receives the forwarded ref for DOM access
   - Establishes the document structure and dimensions

3. **ResumeHeader**
   - Contains the top banner, name section, and contact information
   - Composed of:
     - **TopBanner**: Colored accent bar at the top of the resume
     - **NameSection**: Container for the profile image and name
     - **NameWrapper**: Flexbox container for profile image and name
     - **ContactInfo**: Renders contact details from `personalInfo.contactInfo`

4. **SummarySection**
   - Displays the professional summary with title and content
   - Uses `dangerouslySetInnerHTML` to render formatted HTML from the summary data
   - Applies special formatting to bullet points and paragraphs

5. **TwoColumnSection**
   - Creates the main two-column layout for the resume content
   - Contains:
     - **LeftColumn**: Sidebar with education, certifications, and competencies
     - **RightColumn**: Main content area with professional experience

6. **Section Components**
   - Reusable section containers with consistent styling
   - Each section typically includes:
     - **SectionHeader**: Styled header with underline
     - Content specific to that section

7. **Experience Components**
   - **ExperienceWrapper**: Prevents page breaks within experience entries
   - **ExperienceEntry**: Formats a single job experience
   - **List & MuiListItem**: Renders responsibilities as bullet points

8. **Spacer**
   - Special utility component that only appears in print mode
   - Used to control page breaks in the printed resume

### Data Flow and Rendering

Each component in the Resume hierarchy receives and renders data in a specific way:

1. **Data Import and Distribution**
   - The main Resume component imports all data modules at the top:
     ```jsx
     import { personalInfo } from './ResumeData/personalInfo';
     import { education } from './ResumeData/education';
     import { certifications } from './ResumeData/certifications';
     import { professionalCompetencies } from './ResumeData/professionalCompetencies';
     import { professionalExperience } from './ResumeData/experience';
     import { additionalExperience } from './ResumeData/additionalExperience';
     import { technicalSkills } from './ResumeData/technicalSkills';
     import { summary } from './ResumeData/summary';
     ```
   - Data is passed directly to the appropriate section components

2. **Direct Data Access**
   - Most components access data directly rather than through props
   - Example: The ContactInfo component directly accesses the personalInfo data:
     ```jsx
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
       {/* Additional contact details */}
     </ContactInfo>
     ```

3. **Array Mapping for Lists**
   - Data arrays are mapped to components using array methods
   - Example: Education items are mapped to DOM elements:
     ```jsx
     <Section>
       <SectionHeader>EDUCATION</SectionHeader>
       {education.map((edu, index) => (
         <div key={index} style={{ marginBottom: '1rem' }}>
           <strong>{edu.degree}</strong>
           <div>{edu.institution} - {edu.location}</div>
         </div>
       ))}
     </Section>
     ```

4. **Conditional Rendering**
   - Some components use conditional rendering based on data properties
   - Example: The spacer for page breaks is only rendered for specific companies:
     ```jsx
     {exp.company === 'Vinfolio' && <Spacer height="400px" />}
     ```
   - Optional data fields use conditional rendering or fallbacks:
     ```jsx
     <div>{exp.startDate} - {exp.endDate || 'Present'}</div>
     ```

5. **Nested Component Rendering**
   - Complex data structures are rendered through nested component hierarchies
   - Example: Professional experience entries render both company details and responsibilities:
     ```jsx
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
     ```

### Component Styling and Theme Integration

Each component integrates with the theme system in specific ways:

1. **Theme Access**
   - All styled components receive the theme object through the `theme` parameter
   - Example: The LeftColumn component uses theme values for spacing and colors:
     ```jsx
     const LeftColumn = styled('div')(({ theme }) => ({
       flex: 1,
       backgroundColor: theme.palette.grey[800],
       color: '#ffffff',
       padding: theme.spacing(0, 2, 2, 2),
       // Additional styling
     }));
     ```

2. **Nested Selectors**
   - Components use nested selectors to style their children
   - Example: The RightColumn component styles nested list items:
     ```jsx
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
     ```

3. **Media Queries**
   - Print-specific styling is applied through media queries
   - Example: The BackButton is hidden in print mode:
     ```jsx
     '@media print': {
       display: 'none'
     }
     ```

This component architecture creates a clean separation between data and presentation while maintaining a clear hierarchy of responsibilities.

### Architectural Benefits and Best Practices

The Resume component architecture implements several best practices that provide significant benefits:

1. **Separation of Data and Presentation**
   - Data is stored in dedicated TypeScript files with strong typing
   - UI components focus solely on rendering and styling
   - This separation makes it easy to update resume content without changing component logic

2. **Modular Data Structure**
   - Each section of the resume has its own data file
   - TypeScript interfaces ensure data consistency
   - New sections can be added by creating new data files without modifying existing ones

3. **Reusable Styled Components**
   - Common components like `Section` and `SectionHeader` are reused throughout the resume
   - Styling is consistent across similar elements
   - Theme variables ensure visual coherence

4. **Print and PDF Optimization**
   - Media queries provide different styling for screen and print
   - Page break controls ensure professional-looking printed output
   - Custom spacers solve common print layout challenges

5. **Maintainability and Scalability**
   - New experience entries can be added to data files without changing component code
   - The two-column layout can accommodate additional sections
   - Styling can be updated through the theme without touching component logic

## Technical Implementation

### Component Composition and Rendering

The Resume component uses a combination of styled components and data mapping to render the complete resume:

```jsx
// Main component structure
return (
  <ThemeProvider theme={resumeTheme}>
    <CssBaseline />
    <Button onClick={() => toPDF()} style={{ margin: '1rem' }}>
      Download PDF
    </Button>
    <ResumeWrapper>
      <ResumeContainer ref={targetRef}>
        {/* Navigation */}
        <BackButton onClick={handleBack}>
          <ArrowBackIcon />
          Back
        </BackButton>
        
        {/* Main resume content */}
        <ResumeDocument ref={ref} id="resume-content">
          {/* Header with contact info */}
          <ResumeHeader>...</ResumeHeader>
          
          {/* Professional summary */}
          <SummarySection>...</SummarySection>
          
          {/* Two-column main content */}
          <TwoColumnSection>
            <LeftColumn>...</LeftColumn>
            <RightColumn>...</RightColumn>
          </TwoColumnSection>
          
          {/* Technical skills section */}
          <Section>...</Section>
        </ResumeDocument>
      </ResumeContainer>
    </ResumeWrapper>
  </ThemeProvider>
);
```

### Styled Components and Layout

The resume uses a sophisticated component hierarchy with styled-components and Material UI:

#### Layout Components

```typescript
// Two-column layout implementation
const TwoColumnSection = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(4),
  marginTop: 0,
  marginBottom: 0
}));

// Left column with dark background
const LeftColumn = styled('div')(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  minWidth: '250px',
  backgroundColor: theme.palette.grey[800], // Dark grey background
  color: '#ffffff',
  padding: theme.spacing(0, 2, 2, 2),
  '& > div': {
    backgroundColor: 'transparent'
  },
  '& .MuiSectionHeader': {
    color: '#ffffff',
    backgroundColor: 'transparent',
    borderBottom: '2px solid #ffffff',
    padding: theme.spacing(1, 0),
    marginBottom: theme.spacing(2)
  }
}));

// Right column with light background
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
    marginTop: '0.5rem'
  }
}));
```

#### Specialized Components for Print Layout

```typescript
// Print-only spacer for controlling page breaks
const Spacer = styled('div')<{ height: string }>(({ height }) => ({
  height: 0,
  width: '100%',
  '@media print': {
    height // Only applies height in print mode
  }
}));

// Prevents page breaks inside experience entries
const ExperienceWrapper = styled('div')(() => ({
  display: 'block',
  breakInside: 'avoid',
  pageBreakInside: 'avoid'
}));
```

### Data Structure and Rendering

Each section of the resume uses strongly-typed interfaces to ensure data consistency and is rendered using component mapping:

```typescript
// Experience data structure
export interface Experience {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  responsibilities: string[];
}

// Sample data implementation
export const professionalExperience: Experience[] = [
  {
    title: 'Software Engineer',
    company: 'TransUnion',
    location: 'Chicago, IL',
    startDate: '2019',
    endDate: '8/24',
    responsibilities: [
      'Develop and deploy scalable software solutions for a customer-facing credit monitoring platform',
      'Established and maintained CI/CD pipelines using Jenkins and Maven',
      // Additional responsibilities...
    ]
  },
  // Additional experience entries...
];

// Rendering experience data in the component
{professionalExperience.map((exp, index: number) => (
  <React.Fragment key={index}>
    {/* Conditional spacer for page break control */}
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
```

This approach allows for easy maintenance and updates to resume content without modifying the rendering logic.

### PDF Generation

The Resume component uses the `react-to-pdf` library to generate a downloadable PDF with specific page settings:

```jsx
const { toPDF, targetRef } = usePDF({
  filename: 'resume.pdf',
  method: 'save',
  page: {
    format: [8.5, 11], // Letter size in inches
    orientation: 'portrait',
    margin: 36 // 0.5 inch in points (72 points = 1 inch)
  }
});
```

The PDF generation is triggered by a button click:

```jsx
<Button onClick={() => toPDF()} style={{ margin: '1rem' }}>
  Download PDF
</Button>
```

The `targetRef` is attached to the main container that should be captured in the PDF:

```jsx
<ResumeContainer ref={targetRef}>
  {/* Resume content */}
</ResumeContainer>
```

### Print Optimization

The component includes several optimizations for print media:

1. **Media Queries**: Special styling for print mode
   ```jsx
   '@media print': {
     padding: theme.spacing(2.5, 0) // Reset padding for print
   }
   ```

2. **Page Break Control**: Preventing awkward breaks in content
   ```jsx
   breakInside: 'avoid',
   pageBreakInside: 'avoid'
   ```

3. **Print-only Spacers**: Custom spacers that only appear when printing
   ```jsx
   {exp.company === 'Vinfolio' && <Spacer height="400px" />}
   ```

4. **Hide UI Elements**: Navigation elements are hidden in print view
   ```jsx
   '@media print': {
     display: 'none'
   }
   ```

These optimizations ensure that the printed resume looks professional and properly formatted, with content appropriately distributed across pages.

### Custom Print Styles

Additional print-specific styles ensure that the exported PDF maintains proper formatting:

```typescript
// Print-specific styling
'@media print': {
  // Font size adjustments for print
  'html, body': { fontSize: '12pt !important' },
  h1: { fontSize: '18pt !important' },
  h3: { fontSize: '14pt !important' },
  'p, div, li, span': { fontSize: '12pt !important', lineHeight: '1.3 !important' },
  
  // Page break controls
  '.section': { pageBreakInside: 'avoid' },
  '.experience-entry': { pageBreakInside: 'avoid' },
  
  // Force all content to be visible
  '.MuiContainer-root': { height: 'auto !important', overflow: 'visible !important' }
}
```

### Theming System

The resume uses a custom Material UI theme for consistent styling:

```typescript
export const resumeTheme: Theme = createTheme({
  typography: {
    fontFamily: '"Arial", "Helvetica", sans-serif',
    h1: {
      fontSize: '22px',
      fontWeight: 700,
      textAlign: 'center',
    },
    h3: {
      fontSize: '14px',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    // Additional typography settings...
  },
  components: {
    MuiList: {
      styleOverrides: {
        root: {
          '& li': {
            fontSize: '0.85rem',
            lineHeight: 1.3,
            marginBottom: '0.25rem',
            paddingLeft: '1.5rem',
            position: 'relative',
            '&::before': {
              content: '"•"',
              position: 'absolute',
              left: '0.5rem'
            }
          }
        }
      }
    },
    // Additional component overrides...
  }
});
```

This approach ensures visual consistency throughout the resume while allowing for easy theme adjustments.

## Advanced Features

### Page Break Control

The resume implements sophisticated page break control for printed and PDF output:

```typescript
// Strategic spacer for controlling page breaks
{exp.company === 'Vinfolio' && <Spacer height="400px" />}

// CSS controls for page breaks
'@media print': {
  '.section': { pageBreakInside: 'avoid' },
  '.experience-entry': { pageBreakInside: 'avoid' },
  // Hide spacers in print mode
  '[style*="height: 400px"]': { display: 'none !important' }
}
```

This technique ensures that content flows properly across pages when printed or exported to PDF.

### Responsive Typography

The resume uses responsive typography that adapts to different display contexts:

```typescript
// Screen display typography
body1: {
  fontSize: '13px',
  lineHeight: 1.4,
},

// Print-specific typography
'@media print': {
  'html, body': { fontSize: '12pt !important' },
  h1: { fontSize: '18pt !important' },
  h3: { fontSize: '14pt !important' },
  'p, div, li, span': { fontSize: '12pt !important', lineHeight: '1.3 !important' }
}
```

This ensures optimal readability in both digital and print formats.

## Best Practices

- **Component Composition**: The resume uses a modular component structure for maintainability
- **Type Safety**: TypeScript interfaces ensure data consistency across the application
- **Styled Components**: CSS-in-JS approach with styled-components for scoped styling
- **Theme Consistency**: Material UI theming for consistent visual language
- **Print Optimization**: Media queries and page break controls for optimal printing
- **Data Separation**: Clear separation between data and presentation logic

## Troubleshooting

### PDF Page Breaks

**Issue**: Content may be cut off at page breaks in the PDF export.

**Solution**: Adjust the spacer heights and use the `page-break-inside: avoid` CSS property on critical containers:

```typescript
// Add strategic spacers before content that should start a new page
{exp.company === 'Vinfolio' && <Spacer height="400px" />}

// CSS to prevent breaking inside important sections
'.section': { pageBreakInside: 'avoid' },
'.experience-entry': { pageBreakInside: 'avoid' }
```

### Font Sizing in PDF

**Issue**: Fonts may appear too small or inconsistent in the exported PDF.

**Solution**: Use point (pt) units for print media and ensure all typography elements have print-specific styles:

```typescript
'@media print': {
  'html, body': { fontSize: '12pt !important' },
  h1: { fontSize: '18pt !important' },
  h3: { fontSize: '14pt !important' },
  'p, div, li, span': { fontSize: '12pt !important', lineHeight: '1.3 !important' }
}
```

## Extending the Resume Component

The modular architecture of the Resume component makes it straightforward to extend with new sections or functionality:

### Adding a New Data Section

1. **Create a new data file**
   - Add a new TypeScript file in the `ResumeData` directory
   - Define an appropriate interface for the data structure
   - Export the data with proper typing

   ```typescript
   // ResumeData/projects.ts
   export interface Project {
     title: string;
     description: string;
     technologies: string[];
     url?: string;
   }

   export const projects: Project[] = [
     {
       title: 'Portfolio Website',
       description: 'Personal portfolio showcasing projects and skills',
       technologies: ['React', 'TypeScript', 'Material-UI'],
       url: 'https://example.com'
     },
     // Additional projects...
   ];
   ```

2. **Import the data in Resume.tsx**
   ```typescript
   import { projects } from './ResumeData/projects';
   ```

3. **Create a styled component for the new section**
   ```typescript
   const ProjectSection = styled('div')(({ theme }) => ({
     marginBottom: theme.spacing(2),
     '& h3': {
       fontSize: '1rem',
       marginBottom: theme.spacing(0.5)
     }
   }));
   ```

4. **Add the new section to the appropriate column**
   ```jsx
   <RightColumn>
     {/* Existing sections */}
     
     <RightColumnHeader>
       <SectionHeader style={{ marginBottom: 0 }}>PROJECTS</SectionHeader>
     </RightColumnHeader>
     <Section style={{ paddingTop: 0 }}>
       {projects.map((project, index) => (
         <ProjectSection key={index}>
           <h3>{project.title}</h3>
           <div>{project.description}</div>
           <div><strong>Technologies:</strong> {project.technologies.join(', ')}</div>
           {project.url && (
             <Link href={project.url} target="_blank" rel="noopener noreferrer">
               View Project
             </Link>
           )}
         </ProjectSection>
       ))}
     </Section>
   </RightColumn>
   ```

### Modifying the Layout

The two-column layout can be adjusted to accommodate different content distributions:

```typescript
// Adjust column proportions
const LeftColumn = styled('div')(({ theme }) => ({
  flex: 1.5, // Increase width ratio
  // Other styling
}));

const RightColumn = styled('div')(({ theme }) => ({
  flex: 2.5, // Adjust width ratio
  // Other styling
}));
```

### Adding Interactive Features

The component can be extended with interactive features for the web version:

```typescript
// Add a collapsible section
const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
  'education': true,
  'experience': true,
  'projects': false
});

const toggleSection = (section: string) => {
  setExpandedSections(prev => ({
    ...prev,
    [section]: !prev[section]
  }));
};

// Use in the component
<SectionHeader 
  onClick={() => toggleSection('projects')}
  style={{ cursor: 'pointer' }}
>
  PROJECTS {expandedSections['projects'] ? '▼' : '►'}
</SectionHeader>
{expandedSections['projects'] && (
  <Section>
    {/* Projects content */}
  </Section>
)}
```

## Conclusion

The Resume component demonstrates effective use of React and Material-UI to create a professional, printable resume. The architecture provides several key advantages:

1. **Separation of Concerns**: Data is cleanly separated from presentation logic
2. **Maintainability**: Updates to resume content can be made without touching component code
3. **Extensibility**: New sections can be added with minimal changes to existing code
4. **Print Optimization**: Special attention to print styling ensures professional PDF output
5. **Responsive Design**: The layout adapts well to different screen sizes

By following the patterns established in this component, developers can create similarly structured components for other data-driven UI elements in the application.

## Related Documentation

- [Material UI Theming](https://mui.com/material-ui/customization/theming/)
- [Styled Components](https://styled-components.com/docs)
- [React-to-PDF Documentation](https://www.npmjs.com/package/react-to-pdf)
- [CSS Paged Media Module](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_paged_media)
