"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("vaccines", [
      // --- Child Vaccines ---
      {
        name: "BCG",
        age_range: "At birth",
        category: "child",
        description: "Tuberculosis prevention vaccine",
        info: "Tuberculosis prevention vaccine",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Hepatitis B",
        age_range: "At birth",
        category: "child",
        info: "It is usually given at birth and protects against Hepatitis B infection, which is a serious, often chronic, liver infection caused by the Hepatitis B Virus (HBV).",
        description: "Protects against Hepatitis B virus infection",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "OPV/IPV",
        age_range: "6 weeks",
        category: "child",
        description: "Protects against poliomyelitis",
        info: "The Oral polio vaccine is usually taken in three doses at about 6, 19 and 14  weeks of age. It serves as protection from poliomyelitis, a highly contagious disease caused by poliovirus.",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Pentavalent",
        age_range: "6 weeks",
        category: "child",
        description: "Protects against DTP, Hepatitis B and Hib",
        info: "Combined vaccine, usually taken by infants at about 6, 10 and 14  weeks in three doses with protection against Diphtheria, Tetanus, Pertussis(DTP), Hepatitis B (Hep B) and Haemophilus influenzae type B (Hi b)",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "PCV",
        age_range: "6 weeks",
        category: "child",
        description: "Prevents pneumococcal disease",
        info: "Three doses taken in three doses at about 6, 10 and 14 weeks of age to prevent pneumococcal disease. Pneumococcal disease is a serious infection caused by Streptococcus pneumoniae bacteria, which can lead to pneumonia, meneningitis, bloodstream infections(sepsis) and ear/sinus infections.",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Rotavirus",
        age_range: "6 weeks - 6 months",
        category: "child",
        description: "Prevents severe diarrhea caused by rotavirus",
        info: "This vaccination is taken in two doses at about 6 and 10 weeks of age. It  prevents severe diarrhea in infants and young children caused by the rotavirus",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "MMR",
        age_range: "6 months",
        category: "child",
        description: "Protects against measles, mumps and rubella",
        info: "Taken at 6 months, it serves as protection from  mumps, measles and rubella (German measles), which are viral diseases.",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Yellow Fever",
        age_range: "9 months",
        category: "child",
        description: "Prevents yellow fever viral infection",
        info: "Usually taken by babies who are 9months old or older, it prevents yellow fever, which is an acute viral hemorrhagic disease transmitted by Aedes mosquitoes in tropical Africa and South America.",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "MCV",
        age_range: "12 months",
        category: "child",
        description: "Prevents meningitis",
        info: "This can be given as a standalone vaccination at about 1 year of age to prevent  Meningitis which is an infection and swelling, called inflammation, of the fluid and membranes around the brain and spinal cord which most often triggers symptoms such as headache, fever and a stiff neck.",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "DTP Booster",
        age_range: "15 months",
        category: "child",
        description: "Booster dose for diphtheria, tetanus and pertussis",
        info: "This is booster protection for  Diphtheria, Tetanus, Pertussis(DTP) and is administered to babies about 15months of age or older.",
        created_at: new Date(),
        updated_at: new Date(),
      },

      // --- Adolescent Vaccines ---
      {
        name: "Tdap",
        age_range: "11-12 years",
        category: "adolescent",
        description: "Booster for tetanus, diphtheria, and pertussis",
        info: "A booster vaccine for adolescents that protects against tetanus, diphtheria, and pertussis (whooping cough). Recommended at ages 11–12 to maintain immunity from childhood DTP vaccines.",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Meningococcal ACWY",
        age_range: "11-12 years",
        category: "adolescent",
        description: "Prevents meningococcal disease",
        info: "A vaccine that protects against four major strains (A, C, W, Y) of meningococcal bacteria, recommended for adolescents aged 11–12 years and before entering college to prevent meningitis.",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "HPV",
        age_range: "9-14 years",
        category: "adolescent",
        description: "Protects against Human Papilloma Virus",
        info: "Protects against Human Papiloma Virus (HPV) which causes almost all cervical cancers, specifically high-risk types 16 and 18, which are responsible for 70% of cases. Prevention is highly effective through the HPV vaccine, which reduces risk by up to 90%, and regular screening (Pap/HPV tests)",
        created_at: new Date(),
        updated_at: new Date(),
      },

      // --- Adult Vaccines ---
      {
        name: "Hepatitis B (Adult Catch-up)",
        age_range: "18+",
        category: "adult",
        description: "Adult hepatitis B vaccination series",
        info: "Adult Hepatits B protection recommended for all adults who have not previously received the vaccine. It is highly effective and safe, taken in 2- or 3-dose series that provides lifelong protection.",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Influenza",
        age_range: "18+",
        category: "adult",
        description: "Annual seasonal flu vaccine",
        info: "The annual seasonal flu vaccine is the most effective way to prevent influenza and its severe complications. Vaccination is recommended for everyone aged 6 months and older, particularly high-risk groups like the elderly, pregnant individuals, and those with chronic conditions. ",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Covid-19",
        age_range: "18+",
        category: "adult",
        description: "Protection against COVID-19 virus",
        info: "COVID-19 vaccine causes the immune system to create proteins called antibodies. These proteins fight infection with the COVID-19 virus. ",
        created_at: new Date(),
        updated_at: new Date(),
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("vaccines", {
      name: [
        "BCG",
        "Hepatitis B",
        "OPV/IPV",
        "Pentavalent",
        "PCV",
        "Rotavirus",
        "MMR",
        "Yellow Fever",
        "MCV",
        "DTP Booster",
        "Tdap",
        "Meningococcal ACWY",
        "HPV",
        "Hepatitis B (Adult Catch-up)",
        "Influenza",
        "Covid-19"
      ]
    }, {});
  }
};