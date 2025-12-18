/**
 * Vaccine Science Facts Database
 * Each fact includes a question with 4 choices (1 correct)
 * Used for revival system - answer correctly to get another chance!
 */

export interface VaccineFact {
  fact: string;
  question: string;
  choices: [string, string, string, string]; // Exactly 4 choices
  correctIndex: number; // 0-3
  category: 'history' | 'science' | 'statistics' | 'diseases' | 'myths';
}

export const VACCINE_FACTS: VaccineFact[] = [
  // === HISTORY ===
  {
    fact: "Edward Jenner created the first vaccine in 1796 using cowpox to protect against smallpox.",
    question: "Who created the first vaccine?",
    choices: ["Louis Pasteur", "Edward Jenner", "Jonas Salk", "Alexander Fleming"],
    correctIndex: 1,
    category: 'history'
  },
  {
    fact: "The word 'vaccine' comes from 'vacca', the Latin word for cow.",
    question: "What does 'vaccine' literally mean?",
    choices: ["From protection", "From cow", "From needle", "From immunity"],
    correctIndex: 1,
    category: 'history'
  },
  {
    fact: "Smallpox was declared eradicated in 1980, the only human disease eliminated by vaccination.",
    question: "When was smallpox officially eradicated?",
    choices: ["1960", "1970", "1980", "1990"],
    correctIndex: 2,
    category: 'history'
  },
  {
    fact: "Jonas Salk developed the polio vaccine in 1955 and refused to patent it.",
    question: "Who developed the polio vaccine?",
    choices: ["Jonas Salk", "Albert Sabin", "Edward Jenner", "Louis Pasteur"],
    correctIndex: 0,
    category: 'history'
  },
  {
    fact: "The MMR vaccine (Measles, Mumps, Rubella) was first licensed in 1971.",
    question: "What does MMR stand for?",
    choices: ["Medical Mandatory Response", "Measles Mumps Rubella", "Multiple Mutation Resistance", "Micro Molecular Reaction"],
    correctIndex: 1,
    category: 'history'
  },
  {
    fact: "Louis Pasteur developed the rabies vaccine in 1885.",
    question: "Louis Pasteur is famous for developing which vaccine?",
    choices: ["Polio", "Smallpox", "Rabies", "Tetanus"],
    correctIndex: 2,
    category: 'history'
  },
  {
    fact: "The first COVID-19 vaccines were developed in under 1 year, a record for vaccine development.",
    question: "How quickly were COVID-19 vaccines developed?",
    choices: ["Under 1 year", "2-3 years", "5 years", "10 years"],
    correctIndex: 0,
    category: 'history'
  },
  {
    fact: "George Washington ordered the Continental Army to be inoculated against smallpox in 1777.",
    question: "Which US leader ordered mass smallpox inoculation of troops?",
    choices: ["Abraham Lincoln", "George Washington", "Thomas Jefferson", "Benjamin Franklin"],
    correctIndex: 1,
    category: 'history'
  },
  
  // === SCIENCE ===
  {
    fact: "Vaccines work by training your immune system to recognize and fight specific pathogens.",
    question: "How do vaccines protect you?",
    choices: ["Kill all bacteria", "Train immune system", "Replace blood cells", "Block all viruses"],
    correctIndex: 1,
    category: 'science'
  },
  {
    fact: "mRNA vaccines teach cells to make a harmless piece of the virus to trigger immunity.",
    question: "What do mRNA vaccines teach your cells to do?",
    choices: ["Destroy DNA", "Make virus pieces", "Stop breathing", "Kill white blood cells"],
    correctIndex: 1,
    category: 'science'
  },
  {
    fact: "Herd immunity occurs when enough people are immune to slow disease spread.",
    question: "What is herd immunity?",
    choices: ["Animal vaccines", "Enough immune people slow spread", "Cow-based immunity", "Group exercise"],
    correctIndex: 1,
    category: 'science'
  },
  {
    fact: "Antibodies are proteins that recognize and neutralize specific pathogens.",
    question: "What are antibodies?",
    choices: ["Vitamins", "Proteins that fight pathogens", "Red blood cells", "Bone marrow"],
    correctIndex: 1,
    category: 'science'
  },
  {
    fact: "Memory B cells allow your immune system to remember pathogens for years or decades.",
    question: "What allows long-term immunity after vaccination?",
    choices: ["Memory B cells", "Extra vaccines", "Strong muscles", "Good diet"],
    correctIndex: 0,
    category: 'science'
  },
  {
    fact: "Adjuvants are ingredients that boost the immune response to vaccines.",
    question: "What do adjuvants do in vaccines?",
    choices: ["Add flavor", "Boost immune response", "Preserve the vaccine", "Color the vaccine"],
    correctIndex: 1,
    category: 'science'
  },
  {
    fact: "Live attenuated vaccines use weakened versions of the actual virus.",
    question: "What is a 'live attenuated' vaccine?",
    choices: ["Dead virus vaccine", "Weakened virus vaccine", "Synthetic vaccine", "Bacterial vaccine"],
    correctIndex: 1,
    category: 'science'
  },
  {
    fact: "T cells are immune cells that directly kill infected cells in your body.",
    question: "What do T cells do?",
    choices: ["Carry oxygen", "Kill infected cells", "Digest food", "Pump blood"],
    correctIndex: 1,
    category: 'science'
  },
  {
    fact: "Vaccines undergo three phases of clinical trials before approval.",
    question: "How many clinical trial phases do vaccines go through?",
    choices: ["1", "2", "3", "5"],
    correctIndex: 2,
    category: 'science'
  },
  {
    fact: "The spike protein on coronaviruses is what mRNA COVID vaccines teach cells to recognize.",
    question: "What protein do COVID mRNA vaccines target?",
    choices: ["Hemoglobin", "Spike protein", "Insulin", "Collagen"],
    correctIndex: 1,
    category: 'science'
  },
  {
    fact: "Booster shots refresh your immune system's memory of a pathogen.",
    question: "Why are booster shots given?",
    choices: ["Add new diseases", "Refresh immune memory", "Cure allergies", "Increase blood pressure"],
    correctIndex: 1,
    category: 'science'
  },
  
  // === STATISTICS ===
  {
    fact: "Vaccines prevent 2-3 million deaths worldwide every year according to WHO.",
    question: "How many deaths do vaccines prevent each year?",
    choices: ["Thousands", "2-3 million", "100 million", "1 billion"],
    correctIndex: 1,
    category: 'statistics'
  },
  {
    fact: "Before vaccines, measles killed about 2.6 million people per year globally.",
    question: "How many died from measles yearly before vaccines?",
    choices: ["26,000", "260,000", "2.6 million", "26 million"],
    correctIndex: 2,
    category: 'statistics'
  },
  {
    fact: "Polio cases have decreased by over 99% since 1988 due to vaccination.",
    question: "By what percentage have polio cases dropped since 1988?",
    choices: ["50%", "75%", "90%", "Over 99%"],
    correctIndex: 3,
    category: 'statistics'
  },
  {
    fact: "The COVID-19 vaccines prevented an estimated 20 million deaths in their first year.",
    question: "How many deaths did COVID vaccines prevent in year one?",
    choices: ["2 million", "20 million", "200 million", "2 billion"],
    correctIndex: 1,
    category: 'statistics'
  },
  {
    fact: "Measles vaccination has prevented over 21 million deaths between 2000-2017.",
    question: "Measles vaccines prevented how many deaths (2000-2017)?",
    choices: ["2.1 million", "21 million", "210 million", "2.1 billion"],
    correctIndex: 1,
    category: 'statistics'
  },
  {
    fact: "95% vaccination rate is typically needed for measles herd immunity.",
    question: "What vaccination rate is needed for measles herd immunity?",
    choices: ["50%", "70%", "85%", "95%"],
    correctIndex: 3,
    category: 'statistics'
  },
  {
    fact: "Tetanus kills about 35,000 newborns each year in areas without vaccination.",
    question: "How many newborns die from tetanus yearly in unvaccinated areas?",
    choices: ["350", "3,500", "35,000", "350,000"],
    correctIndex: 2,
    category: 'statistics'
  },
  {
    fact: "Rotavirus vaccines have reduced child deaths from diarrhea by 30% in some countries.",
    question: "Rotavirus vaccines reduced child diarrhea deaths by?",
    choices: ["3%", "10%", "30%", "90%"],
    correctIndex: 2,
    category: 'statistics'
  },
  {
    fact: "HPV vaccination can prevent up to 90% of HPV-related cancers.",
    question: "What percentage of HPV cancers can the vaccine prevent?",
    choices: ["30%", "50%", "70%", "90%"],
    correctIndex: 3,
    category: 'statistics'
  },
  {
    fact: "Diphtheria killed 15,000+ Americans per year before vaccines; now nearly zero.",
    question: "How many Americans died from diphtheria yearly before vaccines?",
    choices: ["150", "1,500", "15,000+", "150,000"],
    correctIndex: 2,
    category: 'statistics'
  },
  
  // === DISEASES ===
  {
    fact: "Measles is one of the most contagious diseases - one person can infect 12-18 others.",
    question: "How many people can one measles patient infect?",
    choices: ["1-2", "3-5", "12-18", "100+"],
    correctIndex: 2,
    category: 'diseases'
  },
  {
    fact: "Tetanus is caused by bacteria in soil and can enter through small cuts.",
    question: "Where is the tetanus bacteria commonly found?",
    choices: ["Water", "Air", "Soil", "Food"],
    correctIndex: 2,
    category: 'diseases'
  },
  {
    fact: "Whooping cough (pertussis) is called that because of the 'whoop' sound when gasping for air.",
    question: "Why is pertussis called 'whooping cough'?",
    choices: ["Named after Dr. Whoop", "Sound when gasping", "It makes you jump", "Latin translation"],
    correctIndex: 1,
    category: 'diseases'
  },
  {
    fact: "Polio can cause permanent paralysis within hours of infection.",
    question: "What can polio cause within hours?",
    choices: ["Rash", "Permanent paralysis", "Fever only", "Hair loss"],
    correctIndex: 1,
    category: 'diseases'
  },
  {
    fact: "Rubella during pregnancy can cause severe birth defects called Congenital Rubella Syndrome.",
    question: "What can rubella cause during pregnancy?",
    choices: ["Nothing", "Birth defects", "Twins", "Early delivery only"],
    correctIndex: 1,
    category: 'diseases'
  },
  {
    fact: "Mumps can cause painful swelling of the salivary glands and rarely, deafness.",
    question: "Which glands does mumps affect?",
    choices: ["Sweat glands", "Salivary glands", "Adrenal glands", "Thyroid"],
    correctIndex: 1,
    category: 'diseases'
  },
  {
    fact: "Hepatitis B can lead to liver cancer and cirrhosis if untreated.",
    question: "Which organ does Hepatitis B primarily affect?",
    choices: ["Heart", "Lungs", "Liver", "Brain"],
    correctIndex: 2,
    category: 'diseases'
  },
  {
    fact: "COVID-19 can cause 'long COVID' with symptoms lasting months after infection.",
    question: "What is 'long COVID'?",
    choices: ["A tall person with COVID", "Symptoms lasting months", "A COVID variant", "Slow test results"],
    correctIndex: 1,
    category: 'diseases'
  },
  {
    fact: "Chickenpox virus stays dormant and can reactivate as shingles decades later.",
    question: "What can chickenpox reactivate as later in life?",
    choices: ["Measles", "Shingles", "Mumps", "Polio"],
    correctIndex: 1,
    category: 'diseases'
  },
  {
    fact: "Diphtheria creates a thick gray coating in the throat that can block breathing.",
    question: "What does diphtheria create in the throat?",
    choices: ["Sores", "Gray coating", "Blisters", "Nothing"],
    correctIndex: 1,
    category: 'diseases'
  },
  {
    fact: "Rotavirus is the leading cause of severe diarrhea in infants and young children.",
    question: "Rotavirus primarily causes what in children?",
    choices: ["Rash", "Severe diarrhea", "Cough", "Headaches"],
    correctIndex: 1,
    category: 'diseases'
  },
  {
    fact: "HPV (Human Papillomavirus) causes over 90% of cervical cancers.",
    question: "What percentage of cervical cancers are caused by HPV?",
    choices: ["10%", "30%", "60%", "Over 90%"],
    correctIndex: 3,
    category: 'diseases'
  },
  {
    fact: "Meningitis can cause brain damage or death within 24 hours without treatment.",
    question: "How quickly can untreated meningitis be fatal?",
    choices: ["24 hours", "1 week", "1 month", "1 year"],
    correctIndex: 0,
    category: 'diseases'
  },
  {
    fact: "Influenza kills 290,000-650,000 people worldwide each year.",
    question: "How many people die from flu annually worldwide?",
    choices: ["2,900", "29,000", "290,000-650,000", "29 million"],
    correctIndex: 2,
    category: 'diseases'
  },
  {
    fact: "Rabies is almost 100% fatal once symptoms appear, but preventable with vaccines.",
    question: "What is the fatality rate of rabies once symptoms appear?",
    choices: ["10%", "50%", "75%", "Almost 100%"],
    correctIndex: 3,
    category: 'diseases'
  },
  
  // === MYTHS BUSTED ===
  {
    fact: "The fraudulent study linking MMR to autism was retracted and the author lost his medical license.",
    question: "What happened to the 'MMR causes autism' study?",
    choices: ["Proven true", "Retracted as fraud", "Needs more research", "Published worldwide"],
    correctIndex: 1,
    category: 'myths'
  },
  {
    fact: "Vaccines do NOT cause autism - this has been proven by dozens of large studies.",
    question: "Do vaccines cause autism?",
    choices: ["Yes", "Maybe", "No - proven false", "Unknown"],
    correctIndex: 2,
    category: 'myths'
  },
  {
    fact: "Thimerosal (mercury preservative) was removed from most vaccines in 2001 as a precaution.",
    question: "When was thimerosal removed from most vaccines?",
    choices: ["1981", "1991", "2001", "Never removed"],
    correctIndex: 2,
    category: 'myths'
  },
  {
    fact: "Natural immunity from disease often comes with serious risks that vaccines avoid.",
    question: "Why is vaccine immunity safer than natural immunity?",
    choices: ["It's not safer", "Avoids disease risks", "Lasts longer", "Tastes better"],
    correctIndex: 1,
    category: 'myths'
  },
  {
    fact: "Vaccine ingredients are tested for safety - the amounts are too small to cause harm.",
    question: "Why are vaccine ingredients safe?",
    choices: ["They're organic", "Amounts too small to harm", "They're natural", "No ingredients"],
    correctIndex: 1,
    category: 'myths'
  },
  {
    fact: "Getting multiple vaccines at once is safe and well-studied.",
    question: "Is getting multiple vaccines at once safe?",
    choices: ["No, very dangerous", "Only for adults", "Yes, well-studied", "Never tested"],
    correctIndex: 2,
    category: 'myths'
  },
  {
    fact: "Vaccines don't 'overload' the immune system - babies encounter more antigens daily from their environment.",
    question: "Can vaccines 'overload' the immune system?",
    choices: ["Yes, always", "Only in babies", "No, that's a myth", "Sometimes"],
    correctIndex: 2,
    category: 'myths'
  },
  {
    fact: "Aluminum in vaccines is less than what babies consume in breast milk or formula.",
    question: "How much aluminum is in vaccines compared to breast milk?",
    choices: ["Much more", "Same amount", "Less", "Vaccines have none"],
    correctIndex: 2,
    category: 'myths'
  },
  {
    fact: "Vaccines don't contain microchips - this is a baseless conspiracy theory.",
    question: "Do vaccines contain microchips?",
    choices: ["Yes", "Only COVID vaccines", "No, that's false", "In some countries"],
    correctIndex: 2,
    category: 'myths'
  },
  {
    fact: "Vaccine side effects are typically mild (sore arm, fever) and short-lived.",
    question: "What are typical vaccine side effects?",
    choices: ["Permanent damage", "Mild and short-lived", "None ever", "Always severe"],
    correctIndex: 1,
    category: 'myths'
  },
  {
    fact: "Vaccines do NOT alter your DNA - mRNA never enters the cell nucleus.",
    question: "Do mRNA vaccines change your DNA?",
    choices: ["Yes", "Sometimes", "No - mRNA can't enter nucleus", "Only in children"],
    correctIndex: 2,
    category: 'myths'
  },
  {
    fact: "Vaccine-preventable diseases still exist and can return if vaccination rates drop.",
    question: "What happens if vaccination rates drop too low?",
    choices: ["Nothing", "Diseases return", "People get stronger", "Immunity improves"],
    correctIndex: 1,
    category: 'myths'
  },
  {
    fact: "Vaccines are one of the most cost-effective health interventions ever developed.",
    question: "How cost-effective are vaccines as health interventions?",
    choices: ["Not cost-effective", "Moderately effective", "Among the most effective", "Too expensive"],
    correctIndex: 2,
    category: 'myths'
  },
  {
    fact: "Flu vaccines are updated yearly because influenza viruses mutate rapidly.",
    question: "Why are flu vaccines updated each year?",
    choices: ["To make money", "Viruses mutate", "Old vaccines expire", "Government rules"],
    correctIndex: 1,
    category: 'myths'
  },
  {
    fact: "You cannot get the disease from inactivated or mRNA vaccines.",
    question: "Can you get the disease from inactivated vaccines?",
    choices: ["Yes, always", "Sometimes", "No, impossible", "Only if allergic"],
    correctIndex: 2,
    category: 'myths'
  },
  
  // === MORE FACTS ===
  {
    fact: "The BCG vaccine protects against tuberculosis and is one of the most widely used vaccines.",
    question: "What disease does the BCG vaccine prevent?",
    choices: ["Measles", "Polio", "Tuberculosis", "Hepatitis"],
    correctIndex: 2,
    category: 'diseases'
  },
  {
    fact: "Yellow fever vaccine provides lifelong protection with just one dose.",
    question: "How long does yellow fever vaccine protection last?",
    choices: ["1 year", "5 years", "10 years", "Lifetime"],
    correctIndex: 3,
    category: 'science'
  },
  {
    fact: "Japan encephalitis vaccine is recommended for travelers to rural Asia.",
    question: "Where is Japanese encephalitis vaccine recommended?",
    choices: ["Europe", "Rural Asia", "South America", "Australia"],
    correctIndex: 1,
    category: 'diseases'
  },
  {
    fact: "Typhoid vaccine is important for travelers to areas with poor sanitation.",
    question: "When is typhoid vaccine most important?",
    choices: ["In hospitals", "For travelers to poor sanitation areas", "For all children", "Never"],
    correctIndex: 1,
    category: 'diseases'
  },
  {
    fact: "The Hib vaccine prevents Haemophilus influenzae type b, a cause of meningitis.",
    question: "What does the Hib vaccine prevent?",
    choices: ["Flu", "A type of meningitis", "Hepatitis", "Herpes"],
    correctIndex: 1,
    category: 'diseases'
  },
  {
    fact: "Pneumococcal vaccines protect against bacteria that cause pneumonia and meningitis.",
    question: "Pneumococcal vaccines protect against what?",
    choices: ["Viruses only", "Pneumonia-causing bacteria", "Parasites", "Fungi"],
    correctIndex: 1,
    category: 'diseases'
  },
  {
    fact: "Cholera vaccines are available for travelers to high-risk areas.",
    question: "Who should consider cholera vaccines?",
    choices: ["Everyone", "Only children", "Travelers to high-risk areas", "No one"],
    correctIndex: 2,
    category: 'diseases'
  },
  {
    fact: "Anthrax vaccines exist for military and high-risk occupations.",
    question: "Who typically receives anthrax vaccines?",
    choices: ["All adults", "Military/high-risk jobs", "Only children", "Pregnant women"],
    correctIndex: 1,
    category: 'science'
  },
  {
    fact: "Ebola vaccines were developed and used during outbreaks in Africa.",
    question: "Where were Ebola vaccines primarily used?",
    choices: ["USA", "Europe", "Africa", "Asia"],
    correctIndex: 2,
    category: 'history'
  },
  {
    fact: "Dengue vaccines are being developed and used in countries where dengue is common.",
    question: "Where is dengue vaccine most needed?",
    choices: ["Arctic regions", "Tropical countries", "Desert areas", "Mountains"],
    correctIndex: 1,
    category: 'diseases'
  },
  {
    fact: "Malaria vaccines are now being rolled out in Africa - a major breakthrough.",
    question: "What major vaccine breakthrough is happening in Africa?",
    choices: ["COVID-19", "Measles", "Malaria", "Polio"],
    correctIndex: 2,
    category: 'history'
  },
  {
    fact: "Vaccines for pregnant women protect both mother and newborn baby.",
    question: "How do vaccines for pregnant women help?",
    choices: ["Only help mother", "Protect mother and baby", "Don't work during pregnancy", "Harm the baby"],
    correctIndex: 1,
    category: 'science'
  },
  {
    fact: "DTaP vaccine protects against Diphtheria, Tetanus, and Pertussis.",
    question: "What does DTaP stand for?",
    choices: ["Three diseases", "Diphtheria, Tetanus, Pertussis", "A drug company", "Nothing"],
    correctIndex: 1,
    category: 'science'
  },
  {
    fact: "IPV (Inactivated Polio Vaccine) is given by injection, OPV by mouth drops.",
    question: "How is oral polio vaccine (OPV) given?",
    choices: ["Injection", "Mouth drops", "Nasal spray", "Skin patch"],
    correctIndex: 1,
    category: 'science'
  },
  {
    fact: "Varicella vaccine prevents chickenpox and reduces shingles risk later in life.",
    question: "Varicella vaccine prevents which disease?",
    choices: ["Measles", "Mumps", "Chickenpox", "Rubella"],
    correctIndex: 2,
    category: 'diseases'
  },
  {
    fact: "Shingrix vaccine is over 90% effective at preventing shingles in older adults.",
    question: "How effective is Shingrix at preventing shingles?",
    choices: ["30%", "50%", "70%", "Over 90%"],
    correctIndex: 3,
    category: 'statistics'
  },
  {
    fact: "Vaccines have saved more lives than any other medical intervention in history.",
    question: "How do vaccines compare to other medical interventions?",
    choices: ["Least effective", "Average", "Saved more lives than any other", "Not measured"],
    correctIndex: 2,
    category: 'statistics'
  },
  {
    fact: "Cold chain management ensures vaccines stay at proper temperatures from factory to patient.",
    question: "What is 'cold chain' in vaccine distribution?",
    choices: ["A restaurant chain", "Temperature control from factory to patient", "A winter promotion", "Cold storage only"],
    correctIndex: 1,
    category: 'science'
  },
  {
    fact: "GAVI (the Vaccine Alliance) has helped immunize over 1 billion children since 2000.",
    question: "How many children has GAVI helped immunize since 2000?",
    choices: ["1 million", "100 million", "Over 1 billion", "10 billion"],
    correctIndex: 2,
    category: 'statistics'
  },
  {
    fact: "WHO's Expanded Programme on Immunization reaches children in every country.",
    question: "How many countries does WHO's immunization program reach?",
    choices: ["Only rich countries", "50 countries", "100 countries", "Every country"],
    correctIndex: 3,
    category: 'history'
  },
  {
    fact: "Vaccine development now uses computer modeling to speed up the design process.",
    question: "What technology speeds up modern vaccine design?",
    choices: ["Typewriters", "Computer modeling", "Smoke signals", "Carrier pigeons"],
    correctIndex: 1,
    category: 'science'
  },
  {
    fact: "Clinical trials for vaccines involve thousands of volunteers to ensure safety.",
    question: "How many volunteers are in vaccine clinical trials?",
    choices: ["10-20", "100-200", "Thousands", "Millions"],
    correctIndex: 2,
    category: 'science'
  },
  {
    fact: "Vaccine hesitancy was named one of the top 10 threats to global health by WHO.",
    question: "What did WHO name vaccine hesitancy?",
    choices: ["Beneficial", "A top 10 global health threat", "Unimportant", "A personal choice only"],
    correctIndex: 1,
    category: 'statistics'
  },
  {
    fact: "Combination vaccines reduce the number of shots needed while providing the same protection.",
    question: "What is the benefit of combination vaccines?",
    choices: ["Cost more", "Fewer shots, same protection", "Less effective", "More side effects"],
    correctIndex: 1,
    category: 'science'
  },
  {
    fact: "Ring vaccination is a strategy where contacts of infected people are vaccinated first.",
    question: "What is 'ring vaccination'?",
    choices: ["Vaccinating in circles", "Vaccinating contacts of sick people first", "Using ring-shaped needles", "A jewelry promotion"],
    correctIndex: 1,
    category: 'science'
  },
  {
    fact: "Passive immunity from mother to baby lasts only a few months after birth.",
    question: "How long does passive immunity from mother last?",
    choices: ["A few months", "1 year", "5 years", "Lifetime"],
    correctIndex: 0,
    category: 'science'
  },
  {
    fact: "Vaccines are tested on adults before being approved for children.",
    question: "Who are vaccines tested on first?",
    choices: ["Children", "Adults", "Animals only", "No testing needed"],
    correctIndex: 1,
    category: 'science'
  },
  {
    fact: "The immune system of children can handle multiple vaccines at once.",
    question: "Can children's immune systems handle multiple vaccines?",
    choices: ["No, never", "Only one at a time", "Yes, easily", "Only after age 5"],
    correctIndex: 2,
    category: 'science'
  },
  {
    fact: "Vaccines contain antigens that are recognized by the immune system.",
    question: "What do vaccines contain that the immune system recognizes?",
    choices: ["Vitamins", "Antigens", "Antibiotics", "Painkillers"],
    correctIndex: 1,
    category: 'science'
  },
  {
    fact: "Post-marketing surveillance continues monitoring vaccine safety after approval.",
    question: "Does vaccine safety monitoring continue after approval?",
    choices: ["No", "Only for 1 year", "Yes, ongoing surveillance", "Never monitored"],
    correctIndex: 2,
    category: 'science'
  },
  {
    fact: "VAERS in the USA collects reports of vaccine side effects for analysis.",
    question: "What does VAERS collect?",
    choices: ["Vaccine orders", "Side effect reports", "Patient names", "Doctor salaries"],
    correctIndex: 1,
    category: 'science'
  },
  {
    fact: "Most vaccine side effects occur within the first 15 minutes to few days.",
    question: "When do most vaccine side effects occur?",
    choices: ["After 1 year", "First 15 minutes to few days", "Never", "After 10 years"],
    correctIndex: 1,
    category: 'science'
  },
  {
    fact: "Anaphylaxis from vaccines is extremely rare - about 1 in a million doses.",
    question: "How common is anaphylaxis from vaccines?",
    choices: ["1 in 100", "1 in 1,000", "1 in 10,000", "About 1 in a million"],
    correctIndex: 3,
    category: 'statistics'
  },
  {
    fact: "Vaccines are tested for interactions with common medications.",
    question: "Are vaccines tested for drug interactions?",
    choices: ["Never", "Yes", "Only for adults", "Only in emergencies"],
    correctIndex: 1,
    category: 'science'
  },
  {
    fact: "Intranasal vaccines (like FluMist) are given as a nasal spray instead of injection.",
    question: "How are intranasal vaccines administered?",
    choices: ["Injection", "Nasal spray", "Pill", "Eye drops"],
    correctIndex: 1,
    category: 'science'
  },
  {
    fact: "Vaccine storage requirements vary - some need freezing, others just refrigeration.",
    question: "Do all vaccines have the same storage requirements?",
    choices: ["Yes, all frozen", "Yes, all refrigerated", "No, requirements vary", "No storage needed"],
    correctIndex: 2,
    category: 'science'
  },
  {
    fact: "The WHO prequalifies vaccines to ensure they meet international standards.",
    question: "What does WHO prequalification ensure?",
    choices: ["Lowest price", "International quality standards", "Fastest delivery", "Best taste"],
    correctIndex: 1,
    category: 'science'
  },
  {
    fact: "Vaccine manufacturing is highly regulated with strict quality controls.",
    question: "How is vaccine manufacturing regulated?",
    choices: ["No regulation", "Strict quality controls", "Self-regulated", "Only in some countries"],
    correctIndex: 1,
    category: 'science'
  },
  {
    fact: "Global vaccine coverage has increased from 20% in 1980 to over 80% today.",
    question: "How has global vaccine coverage changed since 1980?",
    choices: ["Decreased", "Stayed same", "Increased from 20% to 80%+", "100% coverage"],
    correctIndex: 2,
    category: 'statistics'
  },
  {
    fact: "Vaccines protect not just individuals but entire communities through herd immunity.",
    question: "Who benefits from high vaccination rates?",
    choices: ["Only vaccinated people", "Only unvaccinated people", "Entire communities", "No one"],
    correctIndex: 2,
    category: 'science'
  },
  {
    fact: "Some people cannot be vaccinated due to allergies or immune conditions - herd immunity protects them.",
    question: "Who does herd immunity especially protect?",
    choices: ["Athletes", "Those who can't be vaccinated", "Doctors only", "No one special"],
    correctIndex: 1,
    category: 'science'
  }
];

/**
 * Get a random vaccine fact for the quiz
 */
export function getRandomFact(): VaccineFact {
  const index = Math.floor(Math.random() * VACCINE_FACTS.length);
  return VACCINE_FACTS[index];
}

/**
 * Get multiple random facts (non-repeating)
 */
export function getRandomFacts(count: number): VaccineFact[] {
  const shuffled = [...VACCINE_FACTS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
