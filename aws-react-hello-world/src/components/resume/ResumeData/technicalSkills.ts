export interface SkillCategory {
  category: string;
  skills: string[];
}

export const technicalSkills: SkillCategory[] = [
  {
    category: 'Server Side',
    skills: ['JSP', 'ASP', 'Servlets', 'Drools', 'Struts', 'REST', 'SOAP', 'JMS', 'JPA', 'Hibernate', 'AKKA', 'Spring Boot','JEE','NODE']
  },
  {
    category: 'Client Side',
    skills: ['HTML', 'JavaScript', 'Swing', 'JSF', 'Wicket', 'CSS', 'Bootstrap', 'React', 'Angular in progress']
  },
  {
    category: 'Operating Systems',
    skills: ['Unix', 'Windows', 'Linux', 'Mac OSX', 'NextStep']
  },
  {
    category: 'Languages',
    skills: ['Java', 'C#', 'C', 'C++', 'Objective C', 'Pascal', 'Visual Basic', 'Groovy', 'Scala', 'JavaScript', 'XML']
  },
  {
    category: 'App Servers',
    skills: ['Weblogic', 'JBoss', 'Tomcat', 'Glassfish', 'Wildfly']
  },

  {
    category: 'Database',
    skills: ['Oracle', 'MS SQL Server', 'MYSQL', 'Postgres']
  },
  {
    category: 'Cloud',
    skills: ['AWS']
  },
  {
    category: 'DevOps',
    skills: ['Jenkins', 'Docker', 'Maven']
  }

];
