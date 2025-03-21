export interface Experience {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  responsibilities: string[];
}

export const professionalExperience: Experience[] = [
  {
    title: 'Software Engineer',
    company: 'TransUnion',
    location: 'Chicago, IL',
    startDate: '2019',
    endDate: '8/24',
    responsibilities: [
      'Develop and deploy scalable software solutions for a customer-facing credit monitoring platform as part of the company\'s Vanguard team that led the migration from legacy JQuery/SOAP systems to a modern React/REST API stack to boost performance and maintainability',
      'Developed and integrated Java-based RESTful APIs to support new features and improve system interoperability, ensuring seamless integration with third-party services and internal components',
      'Part of a team tasked with updating the credit monitoring site to meet accessibility standards as laid out by WCAG 2.1 AA compliance requirements',
      'Mentor and guide junior developers, ensuring high code quality through comprehensive reviews and promoting best practices in full-stack development and ADA compliance',
      'Collaborate with multiple stakeholders, including architecture, product, UI/UX, and remote teams, to translate complex business requirements into effective software solutions',
      'Design and optimize system architectures to enhance reliability and performance, manage end-to-end release processes, including documentation, and create Docker images',
      'Implement comprehensive testing strategies using Junit, Jest, Serenity to ensure code integrity',
      'Participated in the production release process using Grafana, Spotfire, Splunk to monitor integrity of production releases'
    ]
  },
  {
    title: 'Contractor',
    company: 'UCSB Avid',
    location: 'Santa Barbara, CA',
    startDate: '2018',
    responsibilities: [
      'Design and implement a person-finder service, enhancing search capabilities across various university departments using SpringBoot and MySQL',
      'Revamp Spring OAuth2 authentication from memory-based to MySQL-based, improving security and scalability for identity services',
      'Integrate SpringBatch into the SpringBoot identity services layer to efficiently manage batch processing and data integration tasks',
      'Develop and optimize Apache Kafka components for real-time data streaming and build REST services to expose and manage functionality securely'
    ]
  },
  {
    title: 'Software Engineer',
    company: 'Vinfolio',
    location: 'Napa, CA',
    startDate: '2016',
    endDate: '2018',
    responsibilities: [
      'Engineered REST APIs for seamless integration with TinEye\'s image recognition service, providing comprehensive documentation via Swagger',
      'Architected a scalable database schema tailored to support customer and administrative app functionalities',
      'Implemented Hibernate ORM for effective data persistence and conducted rigorous testing of back-end REST APIs',
      'Set up Jenkins CI/CD in a Docker environment on AWS EC2 and assisted in designing the VUEJS front-end for administrative features'
    ]
  },
  {
    title: 'Senior Software Engineer',
    company: 'SRI International',
    location: 'San Luis Obispo, CA',
    startDate: '2007',
    endDate: '2016',
    responsibilities: [
      'SIMON: One of the initial Principal Engineers assigned to a high-profile government contract to build a monitoring system for maritime traffic entering and leaving ports. Helped design and implement the SRI SIMON system, a distributed microservices platform, including a rules-based data entitlement module that intercepted outgoing SOAP messages and scrubbed data for users without proper permissions. Helped develop a custom service discovery module to keep services loosely coupled. Led the migration to JEE with JAX-WS and JPA, and developed a test-first BDD development process.',
      'Led complex software solutions, utilizing SOA and REST services to meet business requirements and enhance system performance.',
      'Translated requirements into scalable, high-quality software and mentored junior developers to uphold best coding practices and standards.',
      'Managed the full software development lifecycle, including architecture, implementation, testing, and deployment, while continuously improving processes and integrating new technologies.',
      'Mobius: Developed a Swing GUI for Mobius to visualize knowledge structures and integrated Lisp with Java modules.',
      'ITL: Integrated discrete learning modules into ITL and designed a DSL with ANTLR for sequencing learning examples.',
      'uLanding: Architected and implemented the infrastructure for uLanding, a Web 2.0 social network app for college students, including web framework and database strategies.',
      'Rigel: Refactored a 3D terrain mapping application using NASA\'s Worldwind framework, transitioning from an Ant-based to a multi-module Maven build system, integrating CDI with JBoss Weld, and upgrading the UI from Swing to JavaFX 2.0.',
      'SURF: Spearheaded the creation of a microservices-based internal web application for SRI, implementing a front end with WebSockets, VUEJS, and Bootstrap and a back end with Spring Boot, Spring Cloud, and MySQL to enhance project staffing projections.'
    ]
  }
];


