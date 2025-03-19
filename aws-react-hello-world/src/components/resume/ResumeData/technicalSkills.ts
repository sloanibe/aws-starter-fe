export interface SkillCategory {
  category: string;
  skills: string[];
}

export const technicalSkills: SkillCategory[] = [
  {
    category: 'Server Side',
    skills: ['JSP', 'ASP', 'Servlets', 'Drools', 'Struts', 'REST', 'SOAP', 'JMS', 'JPA', 'Hibernate', 'AKKA', 'Spring Boot']
  },
  {
    category: 'Client Side',
    skills: ['HTML', 'JavaScript', 'Swing', 'JSF', 'Wicket', 'CSS', 'Bootstrap', 'React', 'Angular in progress']
  },
  {
    category: 'Operating Systems',
    skills: ['Unix', 'Windows', 'Linux', 'Mac OSX', 'NextStep Environment']
  },
  {
    category: 'Languages',
    skills: ['Java 8', 'C#', 'C', 'C++', 'Objective C', 'Pascal', 'Visual Basic', 'Groovy', 'Scala', 'JavaScript', 'UML (Unified Modeling Language)', 'XML']
  },
  {
    category: 'App Servers',
    skills: ['Weblogic', 'JBoss', 'Tomcat', 'Glassfish', 'Wildfly']
  },
  {
    category: 'SOA Platforms',
    skills: ['WSO2 Carbon', 'Tuscany', 'CXF', 'Axis2', 'NET', 'J2EE']
  },
  {
    category: 'Database',
    skills: ['Oracle', 'MS SQL Server', 'MYSQL', 'Postgres']
  },
  {
    category: 'Cloud',
    skills: ['AWS EC2', 'RD', 'Route59', 'Spring Cloud', 'Amazon Cloud Services (AWS)']
  },
  {
    category: 'DevOps',
    skills: ['Jenkins', 'Docker', 'Maven']
  },
  {
    category: 'AI Coding Tools',
    skills: ['GitHub', 'Copilot']
  },
  {
    category: 'Automation Tool',
    skills: ['ANT']
  }
];
