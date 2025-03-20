import { useState } from 'react';

interface DocsNavigationProps {
  onSelectDoc: (path: string) => void;
}

interface DocItem {
  id: string;
  title: string;
  path: string;
}

interface DocCategory {
  id: string;
  title: string;
  path: string;
  items: DocItem[];
}

function DocsNavigation({ onSelectDoc }: DocsNavigationProps) {
  const [activeDoc, setActiveDoc] = useState<string>('index');
  const [expandedCategories, setExpandedCategories] = useState<{[key: string]: boolean}>({
    'application-architecture': true,
    'aws-infrastructure': true,
    'aws-primers': true,
    'backend-development': true,
    'documentation-system': true,
    'frontend-development': true,
    'testing': true
  });

  // Define the documentation structure with categories
  // Define individual docs (top-level docs)
  const individualDocs: DocItem[] = [
    { id: 'index', title: 'Documentation Home', path: '/docs/index.md' }
  ];

  // Handle document selection
  const handleDocSelect = (doc: DocItem) => {
    setActiveDoc(doc.id);
    onSelectDoc(doc.path);
  };

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const docCategories: DocCategory[] = [
    {
      id: 'application-architecture',
      title: 'Application Architecture',
      path: '/docs/application-architecture/index.md',
      items: [
        { id: 'deployment-process', title: 'Deployment Process', path: '/docs/application-architecture/deployment-process.md' },
        { id: 'task-app-specification', title: 'Task Tracking Application Specification', path: '/docs/application-architecture/task-app-specification.md' },
        { id: 'troubleshooting-guide', title: 'Troubleshooting Guide', path: '/docs/application-architecture/troubleshooting-guide.md' }
      ]
    },
    {
      id: 'aws-infrastructure',
      title: 'Aws Infrastructure',
      path: '/docs/aws-infrastructure/index.md',
      items: [
        { id: 'api-gateway-setup', title: 'API Gateway HTTPS Setup for Spring Boot API', path: '/docs/aws-infrastructure/api-gateway-setup.md' },
        { id: 's3-cloudfront-setup', title: 'AWS S3 Static Website with CloudFront and Custom Domain Setup', path: '/docs/aws-infrastructure/s3-cloudfront-setup.md' },
        { id: 'ec2-springboot-setup', title: 'EC2 and Spring Boot Setup', path: '/docs/aws-infrastructure/ec2-springboot-setup.md' },
        { id: 'elastic-ip-setup', title: 'Elastic IP Setup', path: '/docs/aws-infrastructure/elastic-ip-setup.md' },
        { id: 'https-configuration', title: 'HTTPS Configuration', path: '/docs/aws-infrastructure/https-configuration.md' },
        { id: 'infrastructure-setup', title: 'Infrastructure Setup', path: '/docs/aws-infrastructure/infrastructure-setup.md' },
        { id: 'nginx-configuration', title: 'NGINX Configuration for AWS Starter Project', path: '/docs/aws-infrastructure/nginx-configuration.md' }
      ]
    },
    {
      id: 'aws-primers',
      title: 'Aws Primers',
      path: '/docs/aws-primers/index.md',
      items: [
        { id: 'aws-concepts-primer', title: 'AWS Concepts Primer', path: '/docs/aws-primers/aws-concepts-primer.md' }
      ]
    },
    {
      id: 'backend-development',
      title: 'Backend Development',
      path: '/docs/backend-development/index.md',
      items: [
        { id: 'api-design', title: 'API Design Principles', path: '/docs/backend-development/api-design.md' },
        { id: 'data-models', title: 'Data Models', path: '/docs/backend-development/data-models.md' },
        { id: 'mongodb-data-model', title: 'MongoDB Data Model for Project Management System', path: '/docs/backend-development/mongodb-data-model.md' },
        { id: 'mongodb-integration', title: 'MongoDB Integration in Spring Boot', path: '/docs/backend-development/mongodb-integration.md' }
      ]
    },
    {
      id: 'documentation-system',
      title: 'Documentation System',
      path: '/docs/documentation-system/index.md',
      items: [
        { id: 'creating-documentation', title: 'Creating Documentation', path: '/docs/documentation-system/creating-documentation.md' },
        { id: 'documentation-templates', title: 'Documentation Templates', path: '/docs/documentation-system/documentation-templates.md' },
        { id: 'frontmatter-guide', title: 'Frontmatter Guide', path: '/docs/documentation-system/frontmatter-guide.md' },
        { id: 'technical-implementation', title: 'Technical Implementation', path: '/docs/documentation-system/technical-implementation.md' },
        { id: 'documentation-workflow', title: 'Documentation Workflow', path: '/docs/documentation-system/documentation-workflow.md' }
      ]
    },
    {
      id: 'frontend-development',
      title: 'Frontend Development',
      path: '/docs/frontend-development/index.md',
      items: [
        { id: 'resume-component-technical-documentation', title: 'Resume Component Technical Documentation', path: '/docs/frontend-development/resume-component-technical-documentation.md' },
        { id: 'api-integration', title: 'API Integration', path: '/docs/frontend-development/api-integration.md' }
      ]
    },
    {
      id: 'testing',
      title: 'Testing',
      path: '/docs/testing/index.md',
      items: [
        { id: 'local-mongodb-guide', title: 'Local Docker MongoDB Guide', path: '/docs/testing/local-mongodb-guide.md' },
        { id: 'serenity-bdd-guide', title: 'Serenity BDD Guide', path: '/docs/testing/serenity-bdd-guide.md' },
        { id: 'task-api-tests', title: 'Task API Testing Documentation', path: '/docs/testing/task-api-tests.md' }
      ]
    }
  ];



  return (
    <div className="docs-navigation">
      <h3>Documentation</h3>
      <ul className="docs-nav-list">
        {individualDocs.map((doc: DocItem) => (
          <li 
            key={doc.id} 
            className={activeDoc === doc.id ? 'active' : ''}
            onClick={() => handleDocSelect(doc)}
          >
            {doc.title}
          </li>
        ))}
        
        {docCategories.map(category => (
          <li key={category.id} className="category-item">
            <div 
              className="category-header"
              onClick={() => toggleCategory(category.id)}
            >
              <span className="category-icon">
                {expandedCategories[category.id] ? '▼' : '►'}
              </span>
              <span 
                className={activeDoc === category.id ? 'active' : ''}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDocSelect({ id: category.id, title: category.title, path: category.path });
                }}
              >
                {category.title}
              </span>
            </div>
            
            {expandedCategories[category.id] && (
              <ul className="category-items">
                {category.items.map(item => (
                  <li 
                    key={item.id} 
                    className={activeDoc === item.id ? 'active' : ''}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDocSelect(item);
                    }}
                  >
                    {item.title}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DocsNavigation;
