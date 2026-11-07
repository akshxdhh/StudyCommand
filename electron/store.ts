import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import {
  AppDataStore,
  Subject,
  Exam,
  TimetableSlot,
  DailySessionRecord,
  AppSettings,
  Topic
} from './types';

export const DEFAULT_APPEARANCE = {
  themeMode: 'dark' as const,
  accentPalette: 'violet' as const,
  primaryAccent: '#8b5cf6',       // Electric Violet (default)
  secondaryAccent: '#00f0ff',     // Cyan highlight
  uiDensity: 'comfortable' as const,
  sidebarCollapsed: false,
  componentStyling: 'rounded' as const,
};

export const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: 'sub-cn',
    code: 'CN',
    name: 'Computer Networks',
    courseCode: 'PCCST501',
    semester: 'S5',
    credits: 4,
    color: '#00f0ff',
    modules: [
      {
        id: 'mod-cn-1',
        moduleNumber: 1,
        name: 'Module 1: Internet Architecture & Application Layer',
        contactHours: 6,
        topics: [
          {
            id: 'top-cn-101',
            title: 'Overview of the Internet & Protocol Layering',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Theory', 'Architecture'],
            subtopics: ['Internet architecture', 'Protocol layering model', 'TCP/IP vs OSI stack']
          },
          {
            id: 'top-cn-102',
            title: 'Application Layer Paradigms & Client-Server Architecture',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Architecture'],
            subtopics: ['Application-layer paradigms', 'Client-server communications', 'Socket overview']
          },
          {
            id: 'top-cn-103',
            title: 'World Wide Web, HTTP & FTP Protocols',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Protocol'],
            subtopics: ['HTTP request/response', 'Persistent vs Non-persistent HTTP', 'FTP control and data connections']
          },
          {
            id: 'top-cn-104',
            title: 'Electronic Mail (SMTP, POP3, IMAP) & DNS Resolution',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Protocol'],
            subtopics: ['Mail user agents and MTAs', 'DNS hierarchy', 'Resource records (A, MX, CNAME)']
          },
          {
            id: 'top-cn-105',
            title: 'Peer-to-Peer Paradigm & Case Study: BitTorrent',
            priority: 'MEDIUM',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['P2P', 'Case Study'],
            subtopics: ['P2P file distribution', 'Torrent, tracker, and choking algorithm']
          }
        ]
      },
      {
        id: 'mod-cn-2',
        moduleNumber: 2,
        name: 'Module 2: Transport & Network Layer with Linux Sockets',
        contactHours: 18,
        topics: [
          {
            id: 'top-cn-201',
            title: 'Transport Layer Services, Protocols & UDP',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Protocol', 'Transport'],
            subtopics: ['Multiplexing and demultiplexing', 'UDP datagram structure', 'UDP checksum calculation']
          },
          {
            id: 'top-cn-202',
            title: 'TCP Protocol: 3-Way Handshake, Flow & Congestion Control',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Algorithm', 'Transport'],
            subtopics: ['TCP segment header', 'Connection establishment & termination', 'Tahoe, Reno congestion window']
          },
          {
            id: 'top-cn-203',
            title: 'Hands-on Sockets: TCP Client/Server & I/O Multiplexing',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Hands-on', 'Linux'],
            subtopics: ['socket(), bind(), listen(), accept()', 'The select() and poll() functions', 'UDP socket programming']
          },
          {
            id: 'top-cn-204',
            title: 'Network Layer: Protocols, IP Addressing & Unicast Routing',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Routing', 'Network'],
            subtopics: ['IPv4 header format', 'Subnetting & CIDR', 'Dijkstra and Bellman-Ford algorithms']
          },
          {
            id: 'top-cn-205',
            title: 'Multicast Routing, Intra/Inter-Domain Routing & Next Gen IP',
            priority: 'MEDIUM',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Routing'],
            subtopics: ['Multicasting basics', 'OSPF vs BGP', 'IPv6 header & transition mechanisms']
          },
          {
            id: 'top-cn-206',
            title: 'Quality of Service (QoS) & Linux Kernel Routing Tables',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Hands-on', 'Linux'],
            subtopics: ['Traffic shaping and Leaky Bucket', 'Linux routing table cache', 'Adding entries using ip command']
          }
        ]
      },
      {
        id: 'mod-cn-3',
        moduleNumber: 3,
        name: 'Module 3: Data-Link Layer, Wireless LANs & Mobile IP',
        contactHours: 11,
        topics: [
          {
            id: 'top-cn-301',
            title: 'Data Link Control (DLC) & Multiple Access Protocols (MAC)',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['MAC', 'Data-Link'],
            subtopics: ['Framing and error detection', 'CSMA/CD and CSMA/CA', 'ALOHA protocols']
          },
          {
            id: 'top-cn-302',
            title: 'Link-Layer Addressing, Ethernet Protocol & Connecting Devices',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Ethernet'],
            subtopics: ['MAC addresses and ARP', 'Standard & Fast Ethernet', 'Bridges, switches, and VLANs']
          },
          {
            id: 'top-cn-303',
            title: 'Wireless LANs (802.11) & Mobile IP Architecture',
            priority: 'MEDIUM',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Wireless'],
            subtopics: ['802.11 architecture & frame format', 'Mobile IP home/foreign agents', 'Tunneling in mobile IP']
          },
          {
            id: 'top-cn-304',
            title: 'Hands-on: Datalink Provider Interface & SOCK_PACKET',
            priority: 'MEDIUM',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Hands-on'],
            subtopics: ['Raw socket access', 'PF_PACKET interface in Linux']
          }
        ]
      },
      {
        id: 'mod-cn-4',
        moduleNumber: 4,
        name: 'Module 4: Network Management & Physical Layer',
        contactHours: 9,
        topics: [
          {
            id: 'top-cn-401',
            title: 'SNMP Architecture & ASN.1 Encoding',
            priority: 'MEDIUM',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Management'],
            subtopics: ['SNMP manager and agents', 'Management Information Base (MIB)', 'ASN.1 basic syntax']
          },
          {
            id: 'top-cn-402',
            title: 'Physical Layer: Data, Signals, Digital & Analog Transmission',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Physical'],
            subtopics: ['Analog vs digital signals', 'PCM and line coding (NRZ, Manchester)', 'Modulation (ASK, FSK, PSK)']
          },
          {
            id: 'top-cn-403',
            title: 'Bandwidth Utilization (Multiplexing) & Transmission Media',
            priority: 'MEDIUM',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Transmission'],
            subtopics: ['FDM, WDM, and TDM', 'Guided media (Twisted pair, Coaxial, Fiber)', 'Unguided wireless media']
          }
        ]
      }
    ]
  },
  {
    id: 'sub-math',
    code: 'S3 Math',
    name: 'Mathematics for Computer and Information Science-3',
    courseCode: 'GAMAT301',
    semester: 'S3',
    credits: 3,
    color: '#3b82f6',
    modules: [
      {
        id: 'mod-math-1',
        moduleNumber: 1,
        name: 'Module 1: Discrete Random Variables & Distributions',
        contactHours: 9,
        topics: [
          {
            id: 'top-math-101',
            title: 'Discrete Random Variables, PMF & CDF',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Numerical', 'Probability'],
            subtopics: ['Random variables definition', 'Probability mass function', 'Cumulative distribution function']
          },
          {
            id: 'top-math-102',
            title: 'Mathematical Expectation, Mean & Variance',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Numerical'],
            subtopics: ['Expected value E(X)', 'Variance Var(X) and Standard Deviation', 'Properties of expectation']
          },
          {
            id: 'top-math-103',
            title: 'Binomial & Poisson Probability Distributions',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Numerical'],
            subtopics: ['Binomial distribution formula and mean/variance', 'Poisson distribution', 'Poisson as limit of binomial']
          },
          {
            id: 'top-math-104',
            title: 'Joint & Marginal PMF, Independent Random Variables',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Numerical'],
            subtopics: ['Joint probability mass function', 'Marginal distributions', 'Expected value of functions of two variables']
          }
        ]
      },
      {
        id: 'mod-math-2',
        moduleNumber: 2,
        name: 'Module 2: Continuous Random Variables & Joint Distributions',
        contactHours: 9,
        topics: [
          {
            id: 'top-math-201',
            title: 'Continuous Random Variables, PDF & CDF',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Numerical'],
            subtopics: ['Probability density function conditions', 'CDF integration', 'Expectation and variance of continuous RVs']
          },
          {
            id: 'top-math-202',
            title: 'Uniform, Normal & Exponential Distributions',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Numerical'],
            subtopics: ['Uniform distribution properties', 'Standard normal distribution Z-scores', 'Exponential distribution memoryless property']
          },
          {
            id: 'top-math-203',
            title: 'Joint & Marginal PDF of Two Continuous Random Variables',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Numerical'],
            subtopics: ['Double integrals for joint PDF', 'Marginal density functions', 'Independence test for continuous RVs']
          }
        ]
      },
      {
        id: 'mod-math-3',
        moduleNumber: 3,
        name: 'Module 3: Limit Theorems & Stochastic Processes',
        contactHours: 9,
        topics: [
          {
            id: 'top-math-301',
            title: 'Markov’s Inequality & Chebyshev’s Inequality',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Theorems', 'Numerical'],
            subtopics: ['Markov bounds for non-negative RVs', 'Chebyshev inequality problems', 'Confidence bounds']
          },
          {
            id: 'top-math-302',
            title: 'Strong Law of Large Numbers & Central Limit Theorem',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Theorems'],
            subtopics: ['Convergence in probability', 'Central limit theorem normal approximation', 'Applications in sampling']
          },
          {
            id: 'top-math-303',
            title: 'Stochastic Processes: Discrete & Continuous Time',
            priority: 'MEDIUM',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Stochastic'],
            subtopics: ['Definition of stochastic process', 'Counting processes', 'Poisson process interarrival times']
          }
        ]
      },
      {
        id: 'mod-math-4',
        moduleNumber: 4,
        name: 'Module 4: Markov Chains & State Classifications',
        contactHours: 9,
        topics: [
          {
            id: 'top-math-401',
            title: 'Markov Chains, Transition Matrix & Random Walk Model',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Markov', 'Numerical'],
            subtopics: ['Markov property', 'Transition probability matrix', 'Simple random walk formulation']
          },
          {
            id: 'top-math-402',
            title: 'Chapman–Kolmogorov Equations & Multi-step Transitions',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Equations'],
            subtopics: ['Matrix multiplication for n-step transitions', 'Path analysis']
          },
          {
            id: 'top-math-403',
            title: 'Classification of States & Long-Run Proportions',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Numerical'],
            subtopics: ['Accessible and communicating states', 'Irreducible chains', 'Recurrent vs transient states', 'Stationary distribution (pi)']
          }
        ]
      }
    ]
  },
  {
    id: 'sub-daa',
    code: 'DAA',
    name: 'Design and Analysis of Algorithms',
    courseCode: 'PCCST502',
    semester: 'S5',
    credits: 4,
    color: '#10b981',
    modules: [
      {
        id: 'mod-daa-1',
        moduleNumber: 1,
        name: 'Module 1: Complexity Analysis, Recurrences & AVL Trees',
        contactHours: 11,
        topics: [
          {
            id: 'top-daa-101',
            title: 'Algorithm Criteria & Asymptotic Notations (O, Ω, Θ)',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Foundations'],
            subtopics: ['Best, worst, average case', 'Properties of asymptotic notations', 'Time & space complexity calculation']
          },
          {
            id: 'top-daa-102',
            title: 'Analysis of Recursive Algorithms: Recurrence Solutions',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Numerical', 'Recurrence'],
            subtopics: ['Iteration method', 'Recursion tree method', 'Substitution method']
          },
          {
            id: 'top-daa-103',
            title: 'Master’s Theorem & Balanced AVL Trees Rotations',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Data Structures'],
            subtopics: ['Master theorem cases 1, 2, 3', 'AVL tree balance factor', 'LL, RR, LR, RL tree rotations']
          }
        ]
      },
      {
        id: 'mod-daa-2',
        moduleNumber: 2,
        name: 'Module 2: Disjoint Sets, Graphs & Divide-and-Conquer',
        contactHours: 11,
        topics: [
          {
            id: 'top-daa-201',
            title: 'Disjoint Sets: Union by Rank & Path Compression',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Data Structures'],
            subtopics: ['Disjoint set operations', 'Union and find algorithms', 'Connected components of graphs']
          },
          {
            id: 'top-daa-202',
            title: 'Graph Traversals: BFS, DFS, SCC & Topological Sorting',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Graph', 'Algorithm'],
            subtopics: ['BFS and DFS complexity analysis', 'Strongly Connected Components', 'DAG topological sort']
          },
          {
            id: 'top-daa-203',
            title: 'Divide-and-Conquer: Merge Sort & Strassen’s Matrix Multiplication',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Algorithm'],
            subtopics: ['Control abstraction', 'Merge sort analysis', 'Strassen algorithm recurrence: T(n) = 7T(n/2) + O(n^2)']
          }
        ]
      },
      {
        id: 'mod-daa-3',
        moduleNumber: 3,
        name: 'Module 3: Greedy, Dynamic Programming & Backtracking',
        contactHours: 11,
        topics: [
          {
            id: 'top-daa-301',
            title: 'Greedy Strategy: Fractional Knapsack, Kruskal & Prim MST',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Greedy', 'Algorithm'],
            subtopics: ['Greedy control abstraction', 'Fractional knapsack solution', 'Kruskal and Prim MST with analysis']
          },
          {
            id: 'top-daa-302',
            title: 'Single Source Shortest Path: Dijkstra’s Algorithm',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Shortest Path'],
            subtopics: ['Greedy choice property', 'Relaxation steps', 'Dijkstra complexity with min-heap']
          },
          {
            id: 'top-daa-303',
            title: 'Dynamic Programming: Matrix Chain Multiplication & Floyd-Warshall',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['DP', 'Numerical'],
            subtopics: ['Optimality principle', 'MCM optimal table construction', 'All-pairs shortest path Floyd-Warshall']
          },
          {
            id: 'top-daa-304',
            title: 'Backtracking: Control Abstraction & N-Queens Problem',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Backtracking'],
            subtopics: ['State space tree', '4-Queens & 8-Queens solution', 'Bounding functions']
          }
        ]
      },
      {
        id: 'mod-daa-4',
        moduleNumber: 4,
        name: 'Module 4: Branch & Bound, Complexity Classes & Randomized Algorithms',
        contactHours: 11,
        topics: [
          {
            id: 'top-daa-401',
            title: 'Branch and Bound: Travelling Salesman Problem (TSP)',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Branch & Bound'],
            subtopics: ['Control abstraction', 'Reduced cost matrix', 'State space search']
          },
          {
            id: 'top-daa-402',
            title: 'Tractability, P, NP, NP-Hard & NP-Complete Classes',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Complexity Theory'],
            subtopics: ['Tractable vs intractable', 'Polynomial time verification', 'Cook-Levin theorem overview']
          },
          {
            id: 'top-daa-403',
            title: 'NP-Completeness Proofs: Clique Problem & Vertex Cover',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Proof'],
            subtopics: ['Polynomial reduction technique', '3-SAT to Clique reduction', 'Clique to Vertex Cover reduction']
          },
          {
            id: 'top-daa-404',
            title: 'Approximation (Bin Packing) & Randomized Quick Sort',
            priority: 'MEDIUM',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Randomized'],
            subtopics: ['Bin packing heuristics (First Fit, Best Fit)', 'Monte Carlo vs Las Vegas algorithms', 'Randomized QuickSort expected analysis']
          }
        ]
      }
    ]
  },
  {
    id: 'sub-ml',
    code: 'ML',
    name: 'Machine Learning',
    courseCode: 'PCCST503',
    semester: 'S5',
    credits: 3,
    color: '#a855f7',
    modules: [
      {
        id: 'mod-ml-1',
        moduleNumber: 1,
        name: 'Module 1: ML Paradigms, Parameter Estimation & Regression',
        contactHours: 9,
        topics: [
          {
            id: 'top-ml-101',
            title: 'ML Paradigms: Supervised, Unsupervised & Reinforcement',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Foundations'],
            subtopics: ['ML vs traditional programming', 'Supervised, semi-supervised, unsupervised, reinforcement learning']
          },
          {
            id: 'top-ml-102',
            title: 'Parameter Estimation: Maximum Likelihood (MLE) & MAP',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Estimation', 'Numerical'],
            subtopics: ['Likelihood function', 'Log-likelihood maximization', 'Bayesian MAP formulation with priors']
          },
          {
            id: 'top-ml-103',
            title: 'Linear Regression: Single & Multiple Variables (Gradient Descent & Matrix)',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Regression', 'Algorithm'],
            subtopics: ['Cost function MSE', 'Gradient descent update rule', 'Normal equations matrix method']
          }
        ]
      },
      {
        id: 'mod-ml-2',
        moduleNumber: 2,
        name: 'Module 2: Classification, Regularization & Model Evaluation',
        contactHours: 9,
        topics: [
          {
            id: 'top-ml-201',
            title: 'Classification: Logistic Regression, Naïve Bayes & KNN',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Classification'],
            subtopics: ['Logistic sigmoid hypothesis', 'Bayes theorem with conditional independence', 'K-Nearest Neighbors decision boundaries']
          },
          {
            id: 'top-ml-202',
            title: 'Decision Trees: ID3 Algorithm, Entropy & Information Gain',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Decision Trees'],
            subtopics: ['Entropy and Gini index formulas', 'Information gain computation', 'Tree pruning']
          },
          {
            id: 'top-ml-203',
            title: 'Overfitting, LASSO (L1) & RIDGE (L2) Regularization',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Theory'],
            subtopics: ['Training, validation, test splits', 'L1 sparsity vs L2 weight shrinkage']
          },
          {
            id: 'top-ml-204',
            title: 'Evaluation Metrics: Precision, Recall, F1, ROC/AUC & RMSE',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Metrics'],
            subtopics: ['Confusion matrix', 'ROC curve and AUC interpretation', 'MAE, RMSE, and R-squared']
          }
        ]
      },
      {
        id: 'mod-ml-3',
        moduleNumber: 3,
        name: 'Module 3: Support Vector Machines & Neural Networks',
        contactHours: 9,
        topics: [
          {
            id: 'top-ml-301',
            title: 'Support Vector Machines (SVM): Hyperplanes & Maximum Margin',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['SVM', 'Algorithm'],
            subtopics: ['Linear SVM formulation', 'Support vectors and margin width', 'Non-linear SVM and Kernel trick (RBF, Poly)']
          },
          {
            id: 'top-ml-302',
            title: 'Neural Networks: Perceptron & Multilayer Feed-Forward (MLP)',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Neural Networks'],
            subtopics: ['Perceptron learning rule', 'Architecture of MLP', 'Activation functions: Sigmoid, ReLU, Tanh']
          },
          {
            id: 'top-ml-303',
            title: 'Backpropagation Algorithm: Chain Rule & Weight Updates',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Algorithm', 'Neural Networks'],
            subtopics: ['Forward pass error calculation', 'Backward error propagation', 'Gradient calculation for hidden layers']
          }
        ]
      },
      {
        id: 'mod-ml-4',
        moduleNumber: 4,
        name: 'Module 4: Clustering, PCA, Ensembles & Bias-Variance',
        contactHours: 9,
        topics: [
          {
            id: 'top-ml-401',
            title: 'Unsupervised Clustering: Hierarchical & K-Means Algorithm',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Clustering'],
            subtopics: ['Similarity measures (Euclidean, Manhattan)', 'Agglomerative clustering & dendrograms', 'K-means iterative centroid update']
          },
          {
            id: 'top-ml-402',
            title: 'Dimensionality Reduction: Principal Component Analysis (PCA)',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['PCA', 'Numerical'],
            subtopics: ['Covariance matrix calculation', 'Eigenvalues and Eigenvectors', 'Projection onto principal components']
          },
          {
            id: 'top-ml-403',
            title: 'Ensemble Learning: Bagging, Boosting & Bias-Variance Tradeoff',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Ensembles'],
            subtopics: ['Bootstrap aggregation (Random Forest)', 'Boosting (AdaBoost)', 'Cross validation and bias-variance tradeoff']
          }
        ]
      }
    ]
  },
  {
    id: 'sub-mc',
    code: 'MC',
    name: 'Microcontrollers',
    courseCode: 'PBCST504',
    semester: 'S5',
    credits: 4,
    color: '#f59e0b',
    modules: [
      {
        id: 'mod-mc-1',
        moduleNumber: 1,
        name: 'Module 1: ARM Cortex-M Architecture & Armv8-M',
        contactHours: 9,
        topics: [
          {
            id: 'top-mc-101',
            title: 'Embedded Systems Overview & Embedded C Fundamentals',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Embedded'],
            subtopics: ['Embedded system characteristics', 'Microcontrollers vs Microprocessors', 'Processor classifications']
          },
          {
            id: 'top-mc-102',
            title: 'ARM Cortex-M Series, Cortex-M23/M33 & Armv8-M Architecture',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['ARM'],
            subtopics: ['Cortex-M evolution', 'Armv8-M baseline vs mainline', 'Comparison with Cortex-M3/M4']
          },
          {
            id: 'top-mc-103',
            title: 'ARM Core Features: Registers, Memory Map & Bus Architecture',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Architecture'],
            subtopics: ['R0-R15 registers and xPSR', 'Memory map regions', 'AHB, APB bus matrix']
          }
        ]
      },
      {
        id: 'mod-mc-2',
        moduleNumber: 2,
        name: 'Module 2: STM32U575 Hardware Interfacing & Peripheral Programming',
        contactHours: 11,
        topics: [
          {
            id: 'top-mc-201',
            title: 'STM32 Family, STM32U575 Specifications & Low Power Modes',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['STM32'],
            subtopics: ['STM32U575 features', 'Power management modes (Stop, Standby)', 'STM32CubeIDE & HAL libraries']
          },
          {
            id: 'top-mc-202',
            title: 'GPIO Interfacing: LEDs, 7-Segment, LCD, Keypad & Relays',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Interfacing'],
            subtopics: ['LED blinking program', '16x2 LCD initialization', '4x4 Matrix keypad scanning', 'Relay switching']
          },
          {
            id: 'top-mc-203',
            title: 'ADC & DAC: Analog Sensors, Sine Wave & Audio Signal Generation',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['ADC/DAC'],
            subtopics: ['Potentiometer, LM35 temp, LDR reading', 'DAC output waveform generation', 'Interrupt handling and NVIC']
          },
          {
            id: 'top-mc-204',
            title: 'Timers and Counters: Basic Config & Timer-Based RTC',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Timers'],
            subtopics: ['Prescaler and auto-reload registers', 'Timers as event counters', 'Real-Time Clock (RTC) configuration']
          }
        ]
      },
      {
        id: 'mod-mc-3',
        moduleNumber: 3,
        name: 'Module 3: Serial Protocols (USART, I2C, SPI, CAN) & USB',
        contactHours: 10,
        topics: [
          {
            id: 'top-mc-301',
            title: 'Serial Communication: USART Terminal & I2C Sensor Interfacing',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Protocols'],
            subtopics: ['USART baud rate and framing', 'I2C master/slave transmission', 'Displaying temp sensor on LCD']
          },
          {
            id: 'top-mc-302',
            title: 'SPI Protocol: EEPROM Read/Write Operations',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['SPI'],
            subtopics: ['MOSI, MISO, SCK, CS lines', 'SPI EEPROM command sequence']
          },
          {
            id: 'top-mc-303',
            title: 'CAN Protocol & USB HID Device (Keyboard/Mouse Emulation)',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['CAN', 'USB'],
            subtopics: ['CAN frame format & multi-STM32 network', 'USB descriptors', 'HID keyboard/mouse reports']
          }
        ]
      },
      {
        id: 'mod-mc-4',
        moduleNumber: 4,
        name: 'Module 4: IoT, FreeRTOS & ARM TrustZone Security',
        contactHours: 14,
        topics: [
          {
            id: 'top-mc-401',
            title: 'IoT Protocols (MQTT, CoAP) & Wireless (GSM, Bluetooth, LoRa)',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['IoT', 'Wireless'],
            subtopics: ['MQTT publish/subscribe', 'GSM AT commands (Call/SMS)', 'Bluetooth & LoRa long-range telemetry']
          },
          {
            id: 'top-mc-402',
            title: 'FreeRTOS with STM32: Task Scheduling, Queues & Semaphores',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['RTOS'],
            subtopics: ['Task creation and priorities', 'Preemptive scheduling', 'Inter-task queues and binary semaphores']
          },
          {
            id: 'top-mc-403',
            title: 'ARM TrustZone Technology on STM32U575 & Debugging Strategies',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Security', 'TrustZone'],
            subtopics: ['Secure vs Non-Secure worlds', 'TrustZone configuration on STM32U575', 'Memory optimization and debugging tools']
          }
        ]
      }
    ]
  },
  {
    id: 'sub-dm',
    code: 'DM',
    name: 'Data Mining',
    courseCode: 'PECST525',
    semester: 'S5',
    credits: '5/3',
    color: '#f43f5e',
    modules: [
      {
        id: 'mod-dm-1',
        moduleNumber: 1,
        name: 'Module 1: Data Mining Fundamentals & Data Warehousing',
        contactHours: 8,
        topics: [
          {
            id: 'top-dm-101',
            title: 'Data Mining Concepts, Applications & KDD Process',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Fundamentals'],
            subtopics: ['Data mining definitions', 'KDD vs Data mining', 'Typical architecture of data mining system']
          },
          {
            id: 'top-dm-102',
            title: 'Data Warehouse: OLTP vs OLAP & Multidimensional Models',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Data Warehouse'],
            subtopics: ['Operational DBs vs Data warehouses', 'Star, Snowflake, Fact Constellation schemas', 'OLAP operations (Roll-up, Drill-down, Slice, Dice)']
          },
          {
            id: 'top-dm-103',
            title: 'Data Warehouse Architecture & 3-Tier System',
            priority: 'MEDIUM',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Architecture'],
            subtopics: ['Warehouse database server', 'OLAP server', 'Front-end client tools']
          }
        ]
      },
      {
        id: 'mod-dm-2',
        moduleNumber: 2,
        name: 'Module 2: Data Preprocessing, Cleaning & Reduction',
        contactHours: 9,
        topics: [
          {
            id: 'top-dm-201',
            title: 'Data Cleaning: Missing Values, Noisy Data & Outliers',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Preprocessing'],
            subtopics: ['Need for preprocessing', 'Handling missing values', 'Binning and regression smoothing']
          },
          {
            id: 'top-dm-202',
            title: 'Data Integration & Transformation (Normalization, Scaling)',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Preprocessing'],
            subtopics: ['Correlation analysis (Chi-square, Pearson)', 'Min-Max normalization', 'Z-score standardization']
          },
          {
            id: 'top-dm-203',
            title: 'Data Reduction: Aggregation, Attribute Subset Selection & Discretization',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Reduction'],
            subtopics: ['Data cube aggregation', 'Attribute selection heuristics', 'Numerosity reduction', 'Concept hierarchies']
          }
        ]
      },
      {
        id: 'mod-dm-3',
        moduleNumber: 3,
        name: 'Module 3: Classification & Clustering Algorithms',
        contactHours: 9,
        topics: [
          {
            id: 'top-dm-301',
            title: 'Decision Tree Induction: ID3 Algorithm, Information Gain & Gini',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Decision Tree', 'Numerical'],
            subtopics: ['Decision tree construction principles', 'Information gain computation', 'Gini index calculation']
          },
          {
            id: 'top-dm-302',
            title: 'Neural Networks Classification & Performance Evaluation',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Evaluation'],
            subtopics: ['Multilayer perceptron and backpropagation', 'Accuracy, Precision, Recall, F1 score metrics']
          },
          {
            id: 'top-dm-303',
            title: 'Clustering Paradigms: K-Means, Hierarchical & DBSCAN',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Clustering', 'Algorithm'],
            subtopics: ['Distance metrics (Euclidean, Manhattan)', 'K-means partitioning algorithm', 'Hierarchical clustering (AGNES/DIANA)', 'Density-based DBSCAN']
          }
        ]
      },
      {
        id: 'mod-dm-4',
        moduleNumber: 4,
        name: 'Module 4: Association Rules, Web Mining & Text Mining',
        contactHours: 10,
        topics: [
          {
            id: 'top-dm-401',
            title: 'Association Rule Mining: Apriori Algorithm & FP-Growth',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Association Rules', 'Numerical'],
            subtopics: ['Support and confidence principles', 'Apriori candidate generation & pruning', 'FP-Tree construction & mining']
          },
          {
            id: 'top-dm-402',
            title: 'Web Mining: Content, Structure (PageRank) & Usage Mining',
            priority: 'HIGH',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Web Mining'],
            subtopics: ['Web content vs structure mining', 'PageRank link analysis algorithm', 'Web usage mining and pattern discovery']
          },
          {
            id: 'top-dm-403',
            title: 'Text Mining & Information Retrieval: Indexing & Retrieval Methods',
            priority: 'MEDIUM',
            status: 'NOT_STARTED',
            completed: false,
            estimatedMinutes: 30,
            tags: ['Text Mining'],
            subtopics: ['Text data analysis', 'Inverted index structure', 'Precision and recall for text retrieval']
          }
        ]
      }
    ]
  }
];

export const DEFAULT_EXAMS: Exam[] = [
  // Tentative Lab Examinations
  { id: 'exam-lab-1', subjectCode: 'LAB 1', subjectName: 'Network & Microcontroller Lab (Tentative)', date: '2026-11-10T09:30:00', color: '#00f0ff', isLab: true },
  { id: 'exam-lab-2', subjectCode: 'LAB 2', subjectName: 'Algorithms & Machine Learning Lab (Tentative)', date: '2026-11-11T09:30:00', color: '#10b981', isLab: true },

  // Semester Theory Examinations
  { id: 'exam-cn', subjectCode: 'CN', subjectName: 'Computer Networks', date: '2026-11-23T09:30:00', color: '#00f0ff' },
  { id: 'exam-math', subjectCode: 'S3 Math', subjectName: 'S3 Mathematics', date: '2026-11-24T09:30:00', color: '#3b82f6' },
  { id: 'exam-daa', subjectCode: 'DAA', subjectName: 'Design & Analysis of Algorithms', date: '2026-11-27T09:30:00', color: '#10b981' },
  { id: 'exam-ml', subjectCode: 'ML', subjectName: 'Machine Learning', date: '2026-12-01T09:30:00', color: '#a855f7' },
  { id: 'exam-mc', subjectCode: 'MC', subjectName: 'Microcontrollers', date: '2026-12-03T09:30:00', color: '#f59e0b' },
  { id: 'exam-dm', subjectCode: 'DM', subjectName: 'Data Mining', date: '2026-12-07T09:30:00', color: '#f43f5e' },
];

export const DEFAULT_TIMETABLE: TimetableSlot[] = [
  { id: 'slot-1', sessionNumber: 1, label: 'Study Session 1', startTime: '10:30', endTime: '11:00', type: 'STUDY', defaultSubjectId: 'sub-cn' },
  { id: 'slot-2', label: 'Morning Break', startTime: '11:00', endTime: '11:15', type: 'BREAK' },
  { id: 'slot-3', sessionNumber: 2, label: 'Study Session 2', startTime: '11:15', endTime: '11:45', type: 'STUDY', defaultSubjectId: 'sub-math' },
  { id: 'slot-4', label: 'Mid-Morning Break', startTime: '11:45', endTime: '12:00', type: 'BREAK' },
  { id: 'slot-5', sessionNumber: 3, label: 'Study Session 3', startTime: '12:00', endTime: '12:30', type: 'STUDY', defaultSubjectId: 'sub-daa' },
  { id: 'slot-6', label: 'Lunch & Rest', startTime: '12:30', endTime: '14:00', type: 'LUNCH' },
  { id: 'slot-7', sessionNumber: 4, label: 'Study Session 4', startTime: '14:00', endTime: '14:30', type: 'STUDY', defaultSubjectId: 'sub-ml' },
  { id: 'slot-8', label: 'Afternoon Break', startTime: '14:30', endTime: '14:45', type: 'BREAK' },
  { id: 'slot-9', sessionNumber: 5, label: 'Study Session 5', startTime: '14:45', endTime: '15:15', type: 'STUDY', defaultSubjectId: 'sub-mc' },
  { id: 'slot-10', label: 'Free Time', startTime: '15:15', endTime: '17:00', type: 'FREE' },
  { id: 'slot-11', sessionNumber: 6, label: 'Study Session 6', startTime: '17:00', endTime: '17:30', type: 'STUDY', defaultSubjectId: 'sub-dm' },
  { id: 'slot-12', label: 'Free Time & Dinner', startTime: '17:30', endTime: '19:30', type: 'FREE' },
  { id: 'slot-13', sessionNumber: 7, label: 'Study Session 7', startTime: '19:30', endTime: '20:00', type: 'STUDY', defaultSubjectId: 'sub-cn' },
  { id: 'slot-14', label: 'Free Time', startTime: '20:00', endTime: '21:00', type: 'FREE' },
  { id: 'slot-15', sessionNumber: 8, label: 'Study Session 8', startTime: '21:00', endTime: '21:30', type: 'STUDY', defaultSubjectId: 'sub-math' },
  { id: 'slot-16', label: 'Wind Down & Free Time', startTime: '21:30', endTime: '24:00', type: 'FREE' },
];

export const DEFAULT_SETTINGS: AppSettings = {
  launchOnStartup: true,
  notificationsEnabled: true,
  notificationSoundEnabled: true,
  leadTimeMinutes: 0,
  quietHoursEnabled: true,
  quietHoursStart: '00:30',
  quietHoursEnd: '10:00',
  focusDuration: 30,
  shortBreakDuration: 15,
  longBreakDuration: 30,
  longBreakInterval: 4,
  theme: 'purple',
  appearance: { ...DEFAULT_APPEARANCE },
  minimizeToTrayOnClose: true,
};

export class StoreManager {
  private filePath: string;
  private data: AppDataStore;

  constructor() {
    let userDataPath: string;
    try {
      userDataPath = app ? app.getPath('userData') : path.join(process.cwd(), '.data');
    } catch {
      userDataPath = path.join(process.cwd(), '.data');
    }

    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }

    this.filePath = path.join(userDataPath, 'study-command-store.json');
    this.data = this.loadData();
    this.ensureTodayRecords();
  }

  public getFilePath(): string {
    return this.filePath;
  }

  public getData(): AppDataStore {
    this.ensureTodayRecords();
    return this.data;
  }

  public resetToDefaults(): AppDataStore {
    const today = this.getTodayDateString();
    this.data = {
      version: 2,
      subjects: JSON.parse(JSON.stringify(DEFAULT_SUBJECTS)),
      exams: JSON.parse(JSON.stringify(DEFAULT_EXAMS)),
      timetable: JSON.parse(JSON.stringify(DEFAULT_TIMETABLE)),
      dailyRecords: {},
      focusLogs: [],
      settings: JSON.parse(JSON.stringify(DEFAULT_SETTINGS)),
      lastActiveDate: today,
    };
    this.ensureTodayRecords();
    this.saveData();
    return this.data;
  }

  public updateData(partial: Partial<AppDataStore>): AppDataStore {
    this.data = {
      ...this.data,
      ...partial,
      subjects: partial.subjects || this.data.subjects,
      exams: partial.exams || this.data.exams,
      timetable: partial.timetable || this.data.timetable,
      dailyRecords: partial.dailyRecords || this.data.dailyRecords,
      focusLogs: partial.focusLogs || this.data.focusLogs,
      settings: partial.settings ? { ...this.data.settings, ...partial.settings } : this.data.settings,
    };
    this.saveData();
    return this.data;
  }

  public exportToFile(destPath: string): void {
    fs.writeFileSync(destPath, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  public importFromFile(srcPath: string): AppDataStore {
    const raw = fs.readFileSync(srcPath, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.subjects || !parsed.timetable || !parsed.settings) {
      throw new Error('Invalid Study Command backup file structure.');
    }
    this.data = {
      ...this.data,
      ...parsed,
    };
    this.ensureTodayRecords();
    this.saveData();
    return this.data;
  }

  private loadData(): AppDataStore {
    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        // Auto-migrate to version 2 (full syllabus integration & appearance settings)
        return {
          version: 2,
          subjects: parsed.version && parsed.version >= 2 ? parsed.subjects : DEFAULT_SUBJECTS,
          exams: parsed.version && parsed.version >= 2 ? parsed.exams : DEFAULT_EXAMS,
          timetable: parsed.timetable || DEFAULT_TIMETABLE,
          dailyRecords: parsed.dailyRecords || {},
          focusLogs: parsed.focusLogs || [],
          settings: {
            ...DEFAULT_SETTINGS,
            ...(parsed.settings || {}),
            appearance: {
              ...DEFAULT_APPEARANCE,
              ...(parsed.settings?.appearance || {})
            }
          },
          lastActiveDate: parsed.lastActiveDate || this.getTodayDateString(),
        };
      } catch (err) {
        console.error('Error reading store file, creating fresh store:', err);
      }
    }
    return this.createDefaultStore();
  }

  private createDefaultStore(): AppDataStore {
    const today = this.getTodayDateString();
    const newStore: AppDataStore = {
      version: 2,
      subjects: JSON.parse(JSON.stringify(DEFAULT_SUBJECTS)),
      exams: JSON.parse(JSON.stringify(DEFAULT_EXAMS)),
      timetable: JSON.parse(JSON.stringify(DEFAULT_TIMETABLE)),
      dailyRecords: {},
      focusLogs: [],
      settings: JSON.parse(JSON.stringify(DEFAULT_SETTINGS)),
      lastActiveDate: today,
    };
    this.data = newStore;
    this.saveData();
    return newStore;
  }

  public saveData(): void {
    const tmpPath = `${this.filePath}.tmp`;
    try {
      fs.writeFileSync(tmpPath, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tmpPath, this.filePath);
    } catch (err) {
      console.error('Failed to write store file:', err);
    }
  }

  public getTodayDateString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  public ensureTodayRecords(): DailySessionRecord[] {
    const today = this.getTodayDateString();
    if (!this.data.dailyRecords) {
      this.data.dailyRecords = {};
    }

    if (!this.data.dailyRecords[today]) {
      const studySlots = this.data.timetable.filter(s => s.type === 'STUDY');
      const records: DailySessionRecord[] = studySlots.map((slot) => {
        const subject = this.data.subjects.find(s => s.id === slot.defaultSubjectId);
        let topicTitle = '';
        let topicId = '';
        if (subject && subject.modules.length > 0) {
          for (const m of subject.modules) {
            const firstIncomplete = m.topics.find(t => !t.completed && t.status !== 'COMPLETED');
            if (firstIncomplete) {
              topicTitle = `${m.name.split(':')[0]}: ${firstIncomplete.title}`;
              topicId = firstIncomplete.id;
              break;
            }
          }
        }

        return {
          id: `rec-${today}-${slot.id}`,
          date: today,
          slotId: slot.id,
          sessionNumber: slot.sessionNumber,
          label: slot.label,
          startTime: slot.startTime,
          endTime: slot.endTime,
          status: 'PENDING' as const,
          subjectId: slot.defaultSubjectId,
          topicId: topicId || undefined,
          topicTitle: topicTitle || (subject ? subject.name : 'Focus Session'),
        };
      });
      this.data.dailyRecords[today] = records;
      this.data.lastActiveDate = today;
      this.saveData();
    }

    this.evaluateMissedSessions(today);

    return this.data.dailyRecords[today];
  }

  private evaluateMissedSessions(today: string): void {
    const records = this.data.dailyRecords[today];
    if (!records) return;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    let hasChanges = false;

    for (const record of records) {
      if (record.status === 'PENDING') {
        const [endH, endM] = record.endTime.split(':').map(Number);
        const endMinutes = endH * 60 + endM;
        if (currentMinutes > endMinutes) {
          record.status = 'MISSED';
          hasChanges = true;
        }
      }
    }

    if (hasChanges) {
      this.saveData();
    }
  }
}
