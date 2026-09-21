// Default site content. Everything here is editable later from /admin/content,
// this file only seeds the database on first run.
export const DEFAULT_SITE = {
  name: 'Nikhil Solomon',
  initials: 'NS',
  title: 'Software Engineer',
  tagline: 'Code, Create, Innovate!',
  eyebrow: 'Software Engineer · Zoho · Chennai, India',
  headline: 'I build software that is *reliable, scalable* and built to last.',
  roles: ['software engineer', 'macOS developer', 'search & indexing', 'automation & testing'],
  location: 'Chennai, India',
  timezone: 'Asia/Kolkata',
  available: true,
  availability_text: 'Open to interesting problems',
  email: 'hello@nikhilsolomon.com',
  resume_url: '',
  socials: [
    { label: 'GitHub', url: 'https://github.com/nikhilSolomon' },
    { label: 'LinkedIn', url: '' },
    { label: 'X / Twitter', url: '' }
  ],
  skills: ['Swift', 'Java', 'Python', 'JavaScript', 'macOS & iOS', 'REST APIs', 'WebSockets', 'Apache Lucene', 'Apache Tika', 'OCR', 'XCTest', 'CI/CD', 'Performance Profiling'],
  about_heading: 'Software engineer focused on reliable, scalable and user-focused software.',
  about: [
    'I enjoy solving complex engineering problems, improving application performance, debugging challenging issues, and working across different layers of a product.',
    'My experience spans software development, API integration, search and indexing, automation, performance optimization, testing, debugging, and system integration. Since 2023 I have been building macOS applications at Zoho.'
  ],
  stats: [
    { value: '3+', label: 'years at Zoho' },
    { value: '4', label: 'languages in daily use' },
    { value: '1', label: 'published IEEE paper' }
  ],
  what_i_do: [
    { title: 'Features & backend services', text: 'Design and develop software features, build and integrate APIs and backend services, and work with cross-functional teams to deliver production-ready features.' },
    { title: 'Search, indexing & data processing', text: 'Work with search, indexing and data-processing systems: document parsing, indexing pipelines, attachment processing and search optimization.' },
    { title: 'Performance & reliability', text: 'Analyze CPU, memory, execution-time and processing metrics, identify bottlenecks and optimize resource usage to improve application performance and reliability.' },
    { title: 'Automation, testing & debugging', text: 'Develop automation and testing solutions, and debug and troubleshoot complex technical issues systematically.' }
  ],
  skill_groups: [
    { name: 'Languages', items: ['Swift', 'Java', 'Python', 'JavaScript'] },
    { name: 'Frameworks & technologies', items: ['iOS/macOS development', 'REST APIs', 'WebSockets', 'Apache Lucene', 'Apache Tika', 'OCR'] },
    { name: 'Development & debugging', items: ['Xcode', 'LLDB', 'Git', 'CI/CD', 'Debugging', 'Performance profiling'] },
    { name: 'Testing & automation', items: ['Unit testing', 'UI automation', 'Integration testing', 'Test infrastructure'] },
    { name: 'Engineering', items: ['API integration', 'Search & indexing', 'Performance optimization', 'System design', 'Dependency management'] }
  ],
  approach: [
    'Writing maintainable and scalable code',
    'Understanding problems before implementing solutions',
    'Improving performance through measurement and profiling',
    'Automating repetitive processes',
    'Building reliable and testable systems',
    'Debugging problems systematically',
    'Continuously learning new technologies'
  ],
  career_goal: 'To build impactful software products while continuously improving my technical depth in software architecture, performance engineering, automation, and scalable systems.',
  timeline: [
    { when: 'Jan 2023 — now', title: 'Software Engineer · Zoho', text: 'macOS application development with AppKit, SwiftUI and XCTest. Search and indexing, performance work, UI test automation and system integration across the product.' },
    { when: '2022 — 2023', title: 'Freelance developer', text: 'Computer vision, image recognition and ML projects for clients across industries, including OpenCV-based object detection and predictive models.' },
    { when: '2019 — 2022', title: 'B.Tech, Computer Science · Karunya University', text: 'System design and algorithm development projects that set the foundation for a career in software engineering.' }
  ],
  seo: {
    description: 'Nikhil Solomon is a software engineer at Zoho building reliable, scalable software: macOS apps, search and indexing, performance optimization and test automation.',
    keywords: 'Nikhil Solomon, software engineer, macOS developer, Swift, Apache Lucene, Zoho, portfolio'
  }
};

export const DEFAULT_PROJECTS = [
  {
    slug: 'search-and-indexing', title: 'Search & Indexing', kicker: 'Search · Data processing', year: '2024',
    tags: ['Apache Lucene', 'Apache Tika', 'Java', 'Swift'], seed: 1, hue: 'a', featured: 1,
    summary: 'Search and indexing for large volumes of content, from document parsing to query optimization.',
    role: 'Software engineer', team: 'Product engineering team', duration: 'Ongoing',
    result_value: 'Large-scale', result_label: 'content indexed and searchable',
    body: `Developed search and indexing functionality for processing large volumes of data and improving content discoverability.

**What the work covered**

- Document parsing and text extraction for many file types, including attachments
- Indexing pipelines that keep the index fresh without blocking the user
- Attachment processing and OCR for scanned content
- Search optimization: relevance, query performance and index size

**Why it matters**

Users find what they are looking for faster, and content that used to be invisible to search (attachments, scanned documents) is now discoverable.`,
    links: {}
  },
  {
    slug: 'performance-optimization', title: 'Performance Optimization', kicker: 'Performance · Profiling', year: '2024',
    tags: ['Profiling', 'Xcode Instruments', 'Swift', 'Memory'], seed: 2, hue: 'b', featured: 1,
    summary: 'Measured CPU, memory and execution time, found the bottlenecks and fixed them.',
    role: 'Software engineer', team: 'Product engineering team', duration: 'Ongoing',
    result_value: 'Lower', result_label: 'CPU and memory footprint',
    body: `Analyzed application performance using CPU, memory, execution-time and processing metrics. Identified bottlenecks and implemented optimizations to improve processing efficiency and resource utilization.

**Approach**

1. Measure first: reproducible benchmarks and profiler traces before touching code
2. Find the real hotspot, not the suspected one
3. Fix, re-measure, and add a regression check so it stays fixed

**Typical wins**

- Removing redundant work in hot paths
- Batching and streaming instead of loading everything into memory
- Moving heavy processing off the main thread`,
    links: {}
  },
  {
    slug: 'ui-test-automation', title: 'UI Test Automation with Image Comparison', kicker: 'Testing · Automation', year: '2023',
    tags: ['XCTest', 'XCUITest', 'Snapshot testing', 'CI/CD'], seed: 3, hue: 'c', featured: 1,
    summary: 'A hybrid UI testing approach combining functional tests with pixel-level visual regression checks.',
    role: 'Software engineer', team: 'Product engineering team', duration: '2023 — ongoing',
    result_value: 'Fewer', result_label: 'manual validation cycles',
    body: `Built and improved automated testing workflows to increase test reliability and reduce manual validation. Worked on UI automation, regression testing, debugging test failures and improving test infrastructure.

**Project features**

- Automated UI testing using the XCTest framework
- Image comparison-based validation to detect visual regressions
- Pixel-by-pixel analysis for layout verification
- Traditional functional tests for buttons, labels and text fields
- Snapshot testing for tracking UI changes over time
- CI/CD integration for continuous testing

**Challenges and solutions**

Dynamic UI elements, screen resolution differences and fluctuating test environments were handled with tolerance levels in image comparison, dynamic element handling for varying UI states, and baseline images to compare expected versus actual UI.`,
    links: {}
  },
  {
    slug: 'api-and-system-integration', title: 'API & System Integration', kicker: 'APIs · Integration', year: '2023',
    tags: ['REST', 'WebSockets', 'OAuth', 'Swift'], seed: 4, hue: 'd', featured: 1,
    summary: 'REST and WebSocket integrations, authentication flows and cross-component changes.',
    role: 'Software engineer', team: 'Product engineering team', duration: 'Ongoing',
    result_value: 'End-to-end', result_label: 'integrations shipped',
    body: `Worked with REST APIs, WebSocket-based communication, authentication flows and service integrations. Investigated integration issues and implemented the changes required across multiple system components.

**Highlights**

- Real-time communication over WebSockets with reconnection and back-off
- Authentication flows and token lifecycle handling
- Diagnosing integration issues that span client, API and backend services
- Coordinating changes across components so they ship together`,
    links: {}
  },
  {
    slug: 'azure-web-deployment-and-secure-authentication', title: 'Azure Web Deployment & Secure Authentication', kicker: 'Cloud · Security', year: '2022',
    tags: ['Azure', 'OAuth 2.0', 'MongoDB', 'APIM'], seed: 5, hue: 'a', featured: 0,
    summary: 'Role-based authentication and secure API services for a web application on Azure.',
    role: 'Freelance developer', team: 'Solo', duration: '2022',
    result_value: 'OAuth 2.0', result_label: 'role-based access in production',
    body: `Configured role-based authentication, OAuth 2.0 setup and secure API service connections for web applications deployed on Azure. Ensured that only authorized users could access protected resources by integrating identity providers with the application.

**Stack**

- Azure App Service and Azure Functions
- Azure API Management (APIM) in front of the services
- MongoDB for application data
- GitLab CI/CD for deployment`,
    links: {}
  },
  {
    slug: 'number-plate-recognition', title: 'Number Plate Recognition', kicker: 'Computer vision · ML', year: '2022',
    tags: ['Python', 'OpenCV', 'Tesseract OCR', 'TensorFlow'], seed: 6, hue: 'b', featured: 0,
    summary: 'Real-time automatic number plate detection and recognition for security and parking management.',
    role: 'Freelance developer', team: 'Solo', duration: '2022',
    result_value: 'Real-time', result_label: 'plate detection and OCR',
    body: `Developed a solution for automatic detection of vehicle number plates using machine learning algorithms and OpenCV, improving accuracy in real-time vehicle tracking systems.

**Features**

- Real-time number plate detection and recognition
- Optimized image processing for enhanced accuracy
- OCR integration for extracting plate numbers
- Support for multiple license plate formats

**Challenges and solutions**

Varying lighting conditions, blurred images and different plate designs were addressed using adaptive thresholding, deep-learning object detection models and data augmentation.

**Applications**

Traffic management, automated toll collection, security and surveillance, parking management.`,
    links: {}
  },
  {
    slug: 'early-prediction-of-diabetes', title: 'Early Prediction of Diabetes using ML', kicker: 'Machine learning · Research', year: '2022',
    tags: ['Python', 'Scikit-learn', 'XGBoost', 'Ensemble learning'], seed: 7, hue: 'c', featured: 0,
    summary: 'Ensemble learning models for early diabetes prediction, published at IEEE.',
    role: 'Author & developer', team: 'Research project', duration: '2022',
    result_value: 'IEEE', result_label: 'published paper',
    body: `This project uses multiple machine learning algorithms for the early prediction of diabetes based on medical parameters, with ensemble learning to improve accuracy and robustness.

**Features**

- Ensemble learning (Random Forest, AdaBoost, Gradient Boosting) for better accuracy
- Analysis of glucose level, BMI, insulin, age and other parameters
- Imputation for missing data and feature selection to drop irrelevant attributes
- Deployable as a web application for real-time prediction

**Challenges and solutions**

Imbalanced data was handled with SMOTE, and recursive feature elimination selected the most important medical parameters.`,
    links: { paper: 'https://ieeexplore.ieee.org/document/10142749' }
  }
];
