export interface SyllabusReference {
  courseCode: string;
  courseName: string;
  semester: string;
  credits: number | string;
  examHours: string;
  cieMarks: number;
  eseMarks: number;
  pdfPath: string;
  courseObjectives: string[];
  textBooks: Array<{ title: string; authors: string; publisher: string; editionYear?: string }>;
  referenceBooks: Array<{ title: string; authors: string; publisher: string; editionYear?: string }>;
  videoLinks: Array<{ moduleNo?: number; url: string }>;
}

export const SYLLABUS_METADATA: Record<string, SyllabusReference> = {
  'sub-cn': {
    courseCode: 'PCCST501',
    courseName: 'Computer Networks',
    semester: 'S5',
    credits: 4,
    examHours: '2 Hrs. 30 Min.',
    cieMarks: 40,
    eseMarks: 60,
    pdfPath: 'resources/syllabus/PCCST501_CN.pdf',
    courseObjectives: [
      'To introduce the core concepts of computer networking.',
      'To develop a big picture of the internetworking implementation on Linux-based systems.',
      'To impart an overview of network management concepts.'
    ],
    textBooks: [
      { title: 'Computer Networks: A Top-Down Approach', authors: 'Behrouz A Forouzan', publisher: 'McGraw Hill', editionYear: 'SIE, 2017' },
      { title: 'Unix Network Programming, Volume 1: The Sockets Networking API', authors: 'W. Richard Stevens, Andrew M. Rudoff, Bill Fenner', publisher: 'Pearson Education', editionYear: '3/e, 2004' },
      { title: 'TCP/IP Architecture, design, and implementation in Linux', authors: 'Sameer Seth, M. Ajaykumar Venkatesulu', publisher: 'Wiley', editionYear: '1/e, 2008' }
    ],
    referenceBooks: [
      { title: 'Computer Networking: A Top-Down Approach Featuring Internet', authors: 'J. F. Kurose and K. W. Ross', publisher: 'Pearson Education', editionYear: '8/e, 2022' },
      { title: 'Computer Networks, A Systems Approach', authors: 'L. L. Peterson and B. S. Davie', publisher: 'Morgan Kaufmann', editionYear: '5/e, 2011' }
    ],
    videoLinks: [
      { moduleNo: 1, url: 'https://nptel.ac.in/courses/106/105/106105183/' }
    ]
  },
  'sub-math': {
    courseCode: 'GAMAT301',
    courseName: 'Mathematics for Computer and Information Science-3 (Group A)',
    semester: 'S3',
    credits: 3,
    examHours: '2 Hrs. 30 Min.',
    cieMarks: 40,
    eseMarks: 60,
    pdfPath: 'resources/syllabus/GAMAT301_S3_Math.pdf',
    courseObjectives: [
      'To familiarize students with the foundations of probability and analysis of random processes used in various applications in engineering and science.'
    ],
    textBooks: [
      { title: 'Probability and Statistics for Engineering and the Sciences', authors: 'Devore J. L', publisher: 'Cengage Learning', editionYear: '9th edition, 2016' },
      { title: 'Introduction to Probability Models', authors: 'Sheldon M. Ross', publisher: 'Academic Press', editionYear: '13th edition, 2024' }
    ],
    referenceBooks: [
      { title: 'Probability and Random Processes for Electrical and Computer Engineers', authors: 'John A. Gubner', publisher: 'Cambridge University Press', editionYear: '2012' },
      { title: 'Probability Models for Computer Science', authors: 'Sheldon M. Ross', publisher: 'Academic Press', editionYear: '1st edition, 2001' },
      { title: 'Probability, Random Variables and Stochastic Processes', authors: 'Papoulis, A. & Pillai, S.U.', publisher: 'Tata McGrawHill', editionYear: '4th edition, 2002' },
      { title: 'Probability, Statistics and Random Processes', authors: 'Kousalya Pappu', publisher: 'Pearson', editionYear: '2013' }
    ],
    videoLinks: [
      { moduleNo: 1, url: 'https://onlinecourses.nptel.ac.in/noc22_mg31/preview' },
      { moduleNo: 2, url: 'https://onlinecourses.nptel.ac.in/noc22_mg31/preview' },
      { moduleNo: 3, url: 'https://archive.nptel.ac.in/courses/108/103/108103112/' },
      { moduleNo: 4, url: 'https://archive.nptel.ac.in/courses/108/103/108103112/' }
    ]
  },
  'sub-daa': {
    courseCode: 'PCCST502',
    courseName: 'Design and Analysis of Algorithms',
    semester: 'S5',
    credits: 4,
    examHours: '2 Hrs 30 Min.',
    cieMarks: 40,
    eseMarks: 60,
    pdfPath: 'resources/syllabus/PCCST502_DAA.pdf',
    courseObjectives: [
      'To gain a foundational understanding of algorithms and their analysis.',
      'To develop problem-solving skills using various algorithm design paradigms like divide and conquer, dynamic programming, etc.',
      'To understand the concepts of tractable and intractable problems, and different complexity classes (P, NP, NP-hard, NP-complete).'
    ],
    textBooks: [
      { title: 'Introduction to Algorithms', authors: 'T.H. Cormen, C.E. Leiserson, R.L. Rivest, C. Stein', publisher: 'Prentice-Hall India', editionYear: '4/e, 2018' },
      { title: 'Fundamentals of Computer Algorithms', authors: 'Ellis Horowitz, Sartaj Sahni, Sanguthevar Rajasekaran', publisher: 'Orient Longman Universities Press', editionYear: '2/e, 2008' },
      { title: 'Computer Algorithms, Introduction to Design and Analysis', authors: 'Sara Baase and Allen Van Gelder', publisher: 'Pearson Education', editionYear: '3/e, 2009' }
    ],
    referenceBooks: [
      { title: 'Design and Analysis of Algorithms', authors: 'Michael T. Goodrich, Roberto Tamassia', publisher: 'Wiley', editionYear: '1/e, 2021' },
      { title: 'Algorithm Design', authors: 'Jon Kleinberg, Eva Tardos', publisher: 'Pearson Education', editionYear: '1/e, 2005' },
      { title: 'Algorithms', authors: 'Robert Sedgewick, Kevin Wayne', publisher: 'Pearson Education', editionYear: '4/e, 2011' },
      { title: 'Fundamentals of Algorithmics', authors: 'Gilles Brassard, Paul Brately', publisher: 'Pearson Education', editionYear: '1/e, 1996' },
      { title: 'The Algorithm Design Manual', authors: 'Steven S. Skiena', publisher: 'Springer', editionYear: '2/e, 2008' }
    ],
    videoLinks: [
      { moduleNo: 1, url: 'https://archive.nptel.ac.in/courses/106/106/106106131/' },
      { moduleNo: 2, url: 'https://www.coursera.org/learn/dynamic-programming-greedy-algorithms' },
      { moduleNo: 3, url: 'https://online.stanford.edu/courses/soe-ycsalgorithms1-algorithms-design-and-analysis-part-1' },
      { moduleNo: 4, url: 'https://online.stanford.edu/courses/soe-ycs0001-algorithms-design-and-analysis-part-2' }
    ]
  },
  'sub-ml': {
    courseCode: 'PCCST503',
    courseName: 'Machine Learning',
    semester: 'S5',
    credits: 3,
    examHours: '2 Hrs. 30 Min.',
    cieMarks: 40,
    eseMarks: 60,
    pdfPath: 'resources/syllabus/PCCST503_ML.pdf',
    courseObjectives: [
      'To impart the fundamentals principles of machine learning in computer science.',
      'To provide an understanding of the concepts and algorithms of supervised and unsupervised learning.'
    ],
    textBooks: [
      { title: 'Introduction to Machine Learning', authors: 'Ethem Alpaydin', publisher: 'MIT Press', editionYear: '4/e, 2020' },
      { title: 'Data Mining and Analysis: Fundamental Concepts and Algorithms', authors: 'Mohammed J. Zaki, Wagner Meira', publisher: 'Cambridge University Press', editionYear: '1/e, 2016' },
      { title: 'Neural Networks for Pattern Recognition', authors: 'Christopher Bishop', publisher: 'Oxford University Press', editionYear: '1/e, 1998' }
    ],
    referenceBooks: [
      { title: 'Applied Machine Learning', authors: 'M Gopal', publisher: 'McGraw Hill', editionYear: '2/e, 2018' },
      { title: 'Machine Learning using Python', authors: 'Manaranjan Pradhan, U Dinesh Kumar', publisher: 'Wiley', editionYear: '1/e, 2019' },
      { title: 'Machine Learning: Theory and Practice', authors: 'M.N. Murty, V.S. Ananthanarayana', publisher: 'Universities Press', editionYear: '1/e, 2024' }
    ],
    videoLinks: [
      { moduleNo: 1, url: 'https://archive.nptel.ac.in/courses/106/105/106105152/' },
      { moduleNo: 2, url: 'https://archive.nptel.ac.in/courses/106/106/106106139/' },
      { moduleNo: 3, url: 'https://nptel.ac.in/courses/106106202' }
    ]
  },
  'sub-mc': {
    courseCode: 'PBCST504',
    courseName: 'Microcontrollers',
    semester: 'S5',
    credits: 4,
    examHours: '2 Hrs. 30 Min.',
    cieMarks: 60,
    eseMarks: 40,
    pdfPath: 'resources/syllabus/PBCST504_MC.pdf',
    courseObjectives: [
      'To introduce the ARM architecture and ARM-based microcontroller architecture.',
      'To impart knowledge on the hardware and software components to develop embedded systems using STM32 microcontrollers.'
    ],
    textBooks: [
      { title: 'The Definitive Guide to ARM Cortex-M3 and Cortex-M4 Processors', authors: 'Joseph Yiu', publisher: 'Newnes - Elsevier', editionYear: '3/e, 2014' },
      { title: 'Mastering STM32', authors: 'Carmine Noviello', publisher: 'Learnpub', editionYear: '2/e, 2022' }
    ],
    referenceBooks: [
      { title: 'ARM System Developer’s Guide', authors: 'Andrew N. Sloss, Dominic Symes, Chris Wright', publisher: 'Morgan Kaufman', editionYear: '1/e, 2008' },
      { title: 'Embedded System Design with Arm Cortex-M Microcontrollers', authors: 'Cem Ünsalan, Hüseyin Deniz Gürhan, Mehmet Erkin Yücel', publisher: 'Springer', editionYear: '1/e, 2022' },
      { title: 'Introduction to ARM ® Cortex-M Microcontrollers', authors: 'Jonathan W. Valvano', publisher: 'Self-Published', editionYear: '5/e, 2014' }
    ],
    videoLinks: [
      { moduleNo: 1, url: 'https://archive.nptel.ac.in/courses/106/105/106105193/' },
      { moduleNo: 2, url: 'https://www.st.com/resource/en/datasheet/' }
    ]
  },
  'sub-dm': {
    courseCode: 'PECST525',
    courseName: 'Data Mining',
    semester: 'S5',
    credits: '5/3',
    examHours: '2 Hrs. 30 Min.',
    cieMarks: 40,
    eseMarks: 60,
    pdfPath: 'resources/syllabus/PECST525_DM.pdf',
    courseObjectives: [
      'To provide a thorough understanding of the key processes and concepts involved in data mining and data warehousing within application domains.',
      'To enable students to understand the different data pre-processing techniques, fundamentals and advanced concepts of classification, clustering, association rule mining, text mining and web mining, and apply these techniques in real-world scenarios.'
    ],
    textBooks: [
      { title: 'Data Mining Concepts and Techniques', authors: 'Jaiwei Han, Micheline Kamber', publisher: 'Elsevier', editionYear: '3/e, 2006' },
      { title: 'Data Mining: Introductory and Advanced Topics', authors: 'Dunham M H', publisher: 'Pearson Education', editionYear: '1/e, 2006' }
    ],
    referenceBooks: [
      { title: 'Introduction to Data Mining', authors: 'Pang-Ning Tan, Michael Steinbach', publisher: 'Addison Wesley', editionYear: '1/e, 2014' },
      { title: 'Data Mining: Concepts, Models, Methods, and Algorithms', authors: 'Mehmed Kantardzic', publisher: 'Wiley', editionYear: '2/e, 2019' }
    ],
    videoLinks: [
      { moduleNo: 1, url: 'https://youtu.be/ykZ-_UGcYWg?si=qiqynQyjI1sNNiHE' },
      { moduleNo: 2, url: 'https://youtu.be/NSxEiohAH5o?si=ZIJHMiRvpFcNQNMA' },
      { moduleNo: 3, url: 'https://youtu.be/VsYKqOokgaE?si=rgndBZqpzB29LUGg' },
      { moduleNo: 4, url: 'https://youtu.be/N_whCVtfL9M?si=VPMH9NP4vdAaiuPe' }
    ]
  }
};
