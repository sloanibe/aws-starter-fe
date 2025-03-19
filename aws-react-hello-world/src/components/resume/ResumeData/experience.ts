interface Experience {
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
      'Develop and deploy scalable software solutions for a customer-facing credit monitoring platform, leading the migration from legacy JQuery/SOAP systems to a modern React/REST API stack to boost performance and maintainability',
      'Developed and integrated Java-based RESTful APIs to support new features and improve system interoperability, ensuring seamless integration with third-party services and internal components',
      'Established and maintained CI/CD pipelines using Jenkins and Maven, Kubernetes for Java applications, automating build, test, and deployment processes',
      'Mentor and guide junior developers, ensuring high code quality through comprehensive reviews and promoting best practices in full-stack development and ADA compliance',
      'Collaborate with multiple stakeholders, including architecture, product, UI/UX, and remote teams, to translate complex business requirements into effective software solutions',
      'Design and optimize system architectures to enhance reliability and performance, manage end-to-end release processes, including documentation, and create Docker images',
      'Implemented and maintained event driven software architecture with RabbitMQ in Java backend',
      'Implement comprehensive testing strategies using Junit, Jest, Serenity to ensure code integrity',
      'Participated in the production release process using Grafana, Spotfire, Splunk to monitor integrity of production releases'
    ]
  }
];
