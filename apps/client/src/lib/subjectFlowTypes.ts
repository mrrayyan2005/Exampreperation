// Subject-specific flowchart types for UPSC/Indian Civil Services exam preparation
// Each subject has optimized visual styles and templates

export type SubjectType = 'polity' | 'history' | 'geography' | 'economy' | 'environment' | 'ethics';

export interface SubjectFlowConfig {
  id: SubjectType;
  name: string;
  description: string;
  flowType: string;
  icon: string;
  color: string;
  features: string[];
  defaultTemplate: string;
  nodeStyles: {
    primary: string;
    secondary: string;
    tertiary: string;
    connector: string;
  };
  edgeStyle: {
    style: 'solid' | 'dashed' | 'dotted';
    arrow: 'none' | 'triangle' | 'vee';
  };
  layout: {
    name: string;
    direction: string;
    spacing: number;
  };
}

export const subjectFlowConfigs: Record<SubjectType, SubjectFlowConfig> = {
  // POLITY - Knowledge Graph: Hierarchical structure showing constitutional concepts
  polity: {
    id: 'polity',
    name: 'Polity',
    description: 'Knowledge Graph for Constitutional concepts, Government structure, and Legal frameworks',
    flowType: 'Knowledge Graph',
    icon: 'Landmark',
    color: '#3b82f6', // Blue
    features: [
      'Hierarchical node structure',
      'Article/Clause references',
      'Branch relationships',
      'Constitutional hierarchy',
    ],
    defaultTemplate: `Constitution of India
  Preamble
    Sovereignty
    Socialism
    Secularism
    Democracy
    Republic
  Fundamental Rights .color_blue
    Right to Equality (Art 14-18)
      Article 14: Equality before law
      Article 15: Non-discrimination
      Article 16: Equal opportunity
    Right to Freedom (Art 19-22)
      Article 19: Six freedoms
      Article 20: Protection in conviction
    Right against Exploitation (Art 23-24)
    Right to Religion (Art 25-28)
    Cultural Rights (Art 29-30)
    Right to Constitutional Remedies (Art 32)
  Directive Principles (DPSP) .color_green
    Art 36-51: Social and economic rights
  Fundamental Duties .color_orange
    Art 51A: Citizens duties
  Union Government
    President
      Executive Powers
      Legislative Powers
    Prime Minister & Council
    Parliament
      Lok Sabha
      Rajya Sabha
  State Government
    Governor
    Chief Minister
    State Legislature`,
    nodeStyles: {
      primary: '#1e40af',    // Dark blue for constitutional parts
      secondary: '#3b82f6',  // Blue for articles/sections
      tertiary: '#93c5fd',   // Light blue for details
      connector: '#64748b',
    },
    edgeStyle: {
      style: 'solid',
      arrow: 'triangle',
    },
    layout: {
      name: 'dagre',
      direction: 'TB',
      spacing: 1.5,
    },
  },

  // HISTORY - Timeline Flow: Chronological visualization of events
  history: {
    id: 'history',
    description: 'Timeline visualization for Historical events, Dynasties, and Movements',
    name: 'History',
    flowType: 'Timeline Flow',
    icon: 'Clock',
    color: '#a855f7', // Purple
    features: [
      'Chronological ordering',
      'Era/Period grouping',
      'Event relationships',
      'Cause-effect chains',
    ],
    defaultTemplate: `Indian Freedom Struggle
  1857: First War of Independence .color_red
    Revolt begins in Meerut
      Causes
        Political: Annexation policy
        Economic: Exploitation
        Social: Reforms interference
        Military: Greased cartridges
    Spread across India
      Delhi: Bahadur Shah II
      Kanpur: Nana Saheb
      Jhansi: Rani Lakshmibai
      Awadh: Begum Hazrat Mahal
    Suppression by British
    Consequences
      End of East India Company
      Direct Crown rule begins

  1885: Indian National Congress Founded .color_blue
    A.O. Hume initiates
    Early Moderates (1885-1905)
      Dadabhai Naoroji
      Surendranath Banerjee
      Gopal Krishna Gokhale
    Demands
      Administrative reforms
      Indianization of services
      Legislative councils expansion

  1905-1918: Extremist Phase .color_orange
    Partition of Bengal 1905
      Swadeshi Movement
      Boycott of British goods
    All-India Muslim League 1906
    Surat Split 1907
    Morley-Minto Reforms 1909
    Home Rule Movement 1916
      Tilak and Annie Besant

  1919-1947: Mass Movement Phase .color_green
    Rowlatt Act 1919
      Jallianwala Bagh Massacre
    Non-Cooperation 1920-22
      Khilafat Issue
      Chauri Chaura 1922
    Civil Disobedience 1930-34
      Dandi March
      Salt Satyagraha
    Quit India 1942
      Do or Die
      August Kranti
    Independence 1947`,
    nodeStyles: {
      primary: '#7c3aed',    // Purple for major events
      secondary: '#a855f7',  // Light purple for sub-events
      tertiary: '#ddd6fe',   // Very light for details
      connector: '#8b5cf6',
    },
    edgeStyle: {
      style: 'solid',
      arrow: 'triangle',
    },
    layout: {
      name: 'dagre',
      direction: 'LR', // Left to right for timeline
      spacing: 1.8,
    },
  },

  // GEOGRAPHY - Cause-Effect Flow: Shows geographical phenomena and impacts
  geography: {
    id: 'geography',
    name: 'Geography',
    description: 'Cause-Effect visualization for Geographical phenomena, Climate patterns, and Disasters',
    flowType: 'Cause-Effect Flow',
    icon: 'Globe',
    color: '#22c55e', // Green
    features: [
      'Cause nodes (red)',
      'Effect nodes (blue)',
      'Process flow visualization',
      'Impact chains',
    ],
    defaultTemplate: `Monsoon in India
  Causes .color_red
    Differential Heating
      Land heats faster than sea
      Low pressure over land
      High pressure over sea
    ITCZ Movement
      Inter-Tropical Convergence Zone
      Shifts with apparent sun movement
    Pressure Systems
      Tibetan Plateau heating
      Easterly jet stream
    Ocean Currents
      El Niño effect
      La Niña effect

  Mechanism .color_orange
    Southwest Monsoon (June-Sept)
      Onset: Kerala coast
      Progression: North-West
      Withdrawal: West to East
    Northeast Monsoon (Oct-Dec)
      Winter monsoon
      Affects Tamil Nadu

  Effects .color_blue
    Agricultural Impact
      Kharif season crops
      Rice cultivation
      Water reservoir filling
    Economic Impact
      GDP dependency (15-20%)
      Agricultural employment
      Food security
    Environmental Impact
      River rejuvenation
      Groundwater recharge
      Forest growth

  Variability .color_purple
    Droughts
      Causes: Weak monsoon, El Niño
      Effects: Crop failure, famine
    Floods
      Causes: Excess rain, poor drainage
      Effects: Displacement, damage
    Climate Change Impact
      Changing patterns
      Extreme events increase`,
    nodeStyles: {
      primary: '#dc2626',    // Red for causes
      secondary: '#22c55e',  // Green for processes
      tertiary: '#3b82f6',   // Blue for effects
      connector: '#64748b',
    },
    edgeStyle: {
      style: 'solid',
      arrow: 'vee',
    },
    layout: {
      name: 'dagre',
      direction: 'TB',
      spacing: 1.6,
    },
  },

  // ECONOMY - Process + Data Flow: Economic processes with statistics
  economy: {
    id: 'economy',
    name: 'Economy',
    description: 'Process and Data flow for Economic concepts, Budget, and Policy mechanisms',
    flowType: 'Process + Data Flow',
    icon: 'TrendingUp',
    color: '#f59e0b', // Amber/Orange
    features: [
      'Process steps with data',
      'Statistical annotations',
      'Flow indicators',
      'Policy-to-impact chains',
    ],
    defaultTemplate: `GST (Goods and Services Tax)
  Introduction .color_blue
    Implemented: July 1, 2017
    Constitutional Amendment: 101st
    One Nation, One Tax

  Tax Structure .color_orange
    CGST: Central GST
      Collected by Center
      Rate: 0%, 5%, 12%, 18%, 28%
    SGST: State GST
      Collected by States
      Equal to CGST rate
    IGST: Integrated GST
      Inter-state transactions
      Revenue sharing mechanism

  Tax Slabs
    0%: Essential goods
      Food grains, milk
      Healthcare services
    5%: Basic necessities
      Edible oil, sugar
      Tea, coffee
    12%: Standard goods
      Mobile phones
      Processed food
    18%: Standard rate
      Capital goods
      Industrial intermediates
    28%: Luxury/Sin goods
      Automobiles
      Tobacco products

  Benefits .color_green
    For Business
      Input tax credit
      Reduced logistics cost
      Simplified compliance
    For Consumers
      Reduced prices overall
      Transparent taxation
      Single tax burden
    For Government
      Increased tax base
      Better compliance
      Revenue growth

  Challenges .color_red
    Technical issues
      IT infrastructure
      Return filing complexity
    Economic impact
      Initial GDP slowdown
      SME adaptation
    Administrative
      Rate rationalization needed
      E-way bill compliance`,
    nodeStyles: {
      primary: '#f59e0b',    // Amber for processes
      secondary: '#10b981',  // Green for benefits/positive
      tertiary: '#ef4444',   // Red for challenges/negative
      connector: '#6b7280',
    },
    edgeStyle: {
      style: 'solid',
      arrow: 'triangle',
    },
    layout: {
      name: 'dagre',
      direction: 'TB',
      spacing: 1.4,
    },
  },

  // ENVIRONMENT - Concept + Cycle Flow: Cyclical environmental systems
  environment: {
    id: 'environment',
    name: 'Environment',
    description: 'Concept and Cycle visualization for Environmental systems, Ecology, and Sustainability',
    flowType: 'Concept + Cycle Flow',
    icon: 'Leaf',
    color: '#10b981', // Emerald
    features: [
      'Circular/cyclical layouts',
      'Feedback loops',
      'Ecosystem relationships',
      'Sustainability cycles',
    ],
    defaultTemplate: `Carbon Cycle
  Atmosphere .color_blue
    CO2: 415 ppm (current)
    Sources
      Natural: Respiration, Decomposition
      Anthropogenic: Fossil fuels, Industry

  Photosynthesis .color_green
    Plants absorb CO2
      Terrestrial ecosystems
      Forests as carbon sinks
      Agricultural lands
    Algae and phytoplankton
      Marine photosynthesis
      Produces 50% of O2

  Respiration .color_orange
    Living organisms
      Animals release CO2
      Plants (night)
      Microorganisms
    Decomposition
      Dead organic matter
      Soil respiration

  Ocean Absorption .color_cyan
    Dissolved CO2
      Carbonic acid formation
      Ocean acidification
    Biological pump
      Shell formation
      Sedimentation

  Fossil Fuels .color_red
    Coal, Oil, Natural Gas
      Ancient carbon storage
      Extraction and burning
      Rapid CO2 release
    Human Impact
      Deforestation
      Industrial emissions
      Climate change

  Feedback Loops
    Positive (Amplifying)
      Warming → Permafrost melt → Methane release
      Warming → Less ice → Less reflection → More warming
    Negative (Stabilizing)
      More CO2 → More plant growth → More CO2 absorption`,
    nodeStyles: {
      primary: '#059669',    // Emerald for natural processes
      secondary: '#10b981',  // Green for photosynthesis/growth
      tertiary: '#f59e0b',   // Orange for respiration/release
      connector: '#34d399',
    },
    edgeStyle: {
      style: 'solid',
      arrow: 'triangle',
    },
    layout: {
      name: 'concentric', // Circular for cycles
      direction: 'LR',
      spacing: 2.0,
    },
  },

  // ETHICS - Decision Flow: Ethical dilemmas and frameworks
  ethics: {
    id: 'ethics',
    name: 'Ethics',
    description: 'Decision flow for Ethical dilemmas, Moral frameworks, and Case studies',
    flowType: 'Decision Flow',
    icon: 'Scale',
    color: '#ec4899', // Pink
    features: [
      'Decision diamond nodes',
      'Right/wrong branches',
      'Ethical frameworks',
      'Consequence paths',
    ],
    defaultTemplate: `Ethical Decision Making
  Ethical Dilemma
    Conflicting values
    Stakeholder interests
    Legal vs Moral

  Apply Ethical Frameworks .color_purple
    Utilitarian Approach
      Greatest good for greatest number
      Cost-benefit analysis
      Consequentialist ethics
    Deontological Approach
      Duty-based ethics
      Universal principles
      Kant's Categorical Imperative
    Virtue Ethics
      Character-based
      What would a virtuous person do?
      Aristotelian ethics
    Justice Approach
      Fairness and equality
      Rawls' Veil of Ignorance
      Distributive justice

  Decision Criteria .color_blue
    Legality
      Law compliance
      Rules and regulations
    Morality
      Right vs Wrong
      Good vs Evil
    Public Interest
      Welfare maximization
      Transparency
    Professional Ethics
      Code of conduct
      Organizational values

  Decision
    Right Action
      Upholds dignity
      Serves public good
      Legally compliant
      Morally sound

    Wrong Action
      Violates rights
      Self-serving
      Illegal/unethical
      Harmful consequences

  Evaluation .color_orange
  Intended vs Actual consequences
  Short-term vs Long-term impact
  Stakeholder satisfaction
  Personal integrity maintained`,
    nodeStyles: {
      primary: '#ec4899',    // Pink for ethical concepts
      secondary: '#8b5cf6',  // Purple for frameworks
      tertiary: '#10b981',   // Green for right decisions
      connector: '#f472b6',
    },
    edgeStyle: {
      style: 'solid',
      arrow: 'triangle',
    },
    layout: {
      name: 'dagre',
      direction: 'TB',
      spacing: 1.5,
    },
  },
};

// Get subject config by ID
export function getSubjectConfig(subject: SubjectType): SubjectFlowConfig {
  return subjectFlowConfigs[subject];
}

// Get all subjects as array
export function getAllSubjects(): SubjectFlowConfig[] {
  return Object.values(subjectFlowConfigs);
}

// Get subject-specific theme colors
export function getSubjectTheme(subject: SubjectType, isDark: boolean) {
  const config = subjectFlowConfigs[subject];

  return {
    background: isDark ? '#0f172a' : '#ffffff',
    primary: config.nodeStyles.primary,
    secondary: config.nodeStyles.secondary,
    tertiary: config.nodeStyles.tertiary,
    accent: config.color,
    edge: config.nodeStyles.connector,
  };
}

// Parse subject-specific text to cytoscape elements
export function parseSubjectText(text: string, subject: SubjectType) {
  const config = subjectFlowConfigs[subject];

  // Add subject-specific color classes based on content
  let processedText = text;

  // Auto-apply color classes based on content patterns
  switch (subject) {
    case 'geography':
      // Mark causes with red, effects with blue
      processedText = text
        .replace(/^([CAUSES|Cause].*)/gim, '$1 .color_red')
        .replace(/^([EFFECTS|Effect].*)/gim, '$1 .color_blue');
      break;

    case 'history':
      // Highlight years and major events
      processedText = text.replace(/(\d{4}:.*)/g, '$1 .color_purple');
      break;

    case 'economy':
      // Highlight data/percentages
      processedText = text.replace(/(.*\d+%.*)/g, '$1 .color_blue');
      break;

    case 'ethics':
      // Mark decision points
      processedText = text
        .replace(/^([RIGHT|Right].*)/gim, '$1 .color_green')
        .replace(/^([WRONG|Wrong].*)/gim, '$1 .color_red');
      break;
  }

  return processedText;
}

// Templates for quick start
export const subjectTemplates: Record<SubjectType, string[]> = {
  polity: [
    'Constitutional Framework',
    'Parliamentary System',
    'Judicial Structure',
    'Federalism',
    'Fundamental Rights',
    'Emergency Provisions',
  ],
  history: [
    'Ancient Indian History',
    'Medieval India',
    'Modern India (1857-1947)',
    'Freedom Struggle Timeline',
    'Post-Independence',
    'World History',
  ],
  geography: [
    'Monsoon System',
    'River Systems',
    'Climate Patterns',
    'Natural Disasters',
    'Resource Distribution',
    'Population Dynamics',
  ],
  economy: [
    'Budget Process',
    'Banking System',
    'Tax Structure',
    'International Trade',
    'Poverty & Development',
    'Five Year Plans',
  ],
  environment: [
    'Climate Change',
    'Biodiversity',
    'Pollution Cycle',
    'Sustainable Development',
    'Ecosystem Services',
    'Conservation Efforts',
  ],
  ethics: [
    'Ethical Dilemma Case',
    'Moral Frameworks',
    'Public Service Ethics',
    'Corruption Issues',
    'Social Justice',
    'Environmental Ethics',
  ],
};
