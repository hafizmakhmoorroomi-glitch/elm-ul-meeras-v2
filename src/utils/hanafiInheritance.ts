/**
 * Hanafi Inheritance Calculator Core Engine
 * Handled according to standard Hanafi (Hanafi Fiqh) rules of Al-Sirajiyyah.
 */

export interface HeirsInput {
  husband: boolean;
  wivesCount: number; // 0 to 4
  sonsCount: number;
  daughtersCount: number;
  father: boolean;
  mother: boolean;
  grandfather: boolean; // Paternal grandfather (دادا)
  grandmotherPaternal: boolean; // dadi (دادی)
  grandmotherMaternal: boolean; // nani (نانی)
  realBrothersCount: number;
  realSistersCount: number;
  paternalBrothersCount: number; // Consanguine Brothers (علاتی بھائی)
  paternalSistersCount: number; // Consanguine Sisters (علاتی بہن)
  uterineBrothersCount: number; // Maternal Brothers (اخیافی بھائی)
  uterineSistersCount: number; // Maternal Sisters (اخیافی بہن)
  grandsonsCount: number; // Son's son (پوتا)
  granddaughtersCount: number; // Son's daughter (پوٹی)
  unclesCount: number; // Real Paternal Uncle (حقیقی چچا)
}

export interface EstateInput {
  totalAssets: number;
  funeralExpenses: number;
  debts: number;
  willAmount: number; // Cannot exceed 1/3 of net assets after funeral and debts
}

export interface HeirResult {
  id: string;
  nameUrdu: string;
  nameEnglish: string;
  relationType: "zawil_furuz" | "asabah" | "excluded";
  baseShareText: string; // e.g., "1/8", "1/6", "عصبہ"
  baseFraction: number; // Numerical value for math representation
  finalFraction: number; // After Awl, Radd, or Asabah distribution
  percentage: number;
  amount: number;
  reasonUrdu: string;
  isExcluded: boolean;
  excludedBy?: string;
}

export interface CalculationResult {
  totalAssets: number;
  funeralExpenses: number;
  debts: number;
  willDeducted: boolean;
  willAmount: number;
  netEstate: number;
  heirs: HeirResult[];
  baseNumber?: number; // اصل مسئلہ
  baseNumberAfterAwl?: number; // بعد عول
  appliedRule?: "normal" | "awl" | "radd";
  raddTarget?: string; // e.g. "غیر زوجین" or "خالی زوجین"
}

export function calculateInheritance(heirs: HeirsInput, estate: EstateInput): CalculationResult {
  const { totalAssets, funeralExpenses, debts, willAmount } = estate;

  // 1. Deduct Funeral Expenses
  let tempEstate = Math.max(0, totalAssets - funeralExpenses);

  // 2. Deduct Debts
  tempEstate = Math.max(0, tempEstate - debts);

  // 3. Deduct Will (Maximum 1/3 of the remaining estate)
  const remainingAfterExpenses = tempEstate;
  const maxAllowableWill = remainingAfterExpenses / 3;
  const rawWill = Math.max(0, willAmount);
  const finalWill = rawWill > maxAllowableWill ? maxAllowableWill : rawWill;
  const willDeducted = rawWill > 0;
  const netEstate = Math.max(0, remainingAfterExpenses - finalWill);

  // Initialize heirs registry
  const heirsList: HeirResult[] = [];

  // Exclusions (Hajb) rules logic helper
  const hasSon = heirs.sonsCount > 0;
  const hasDaughter = heirs.daughtersCount > 0;
  const hasFather = heirs.father;
  const hasMother = heirs.mother;
  const hasHusband = heirs.husband;
  const hasWife = heirs.wivesCount > 0;
  const hasGrandson = heirs.grandsonsCount > 0;
  const hasGranddaughter = heirs.granddaughtersCount > 0;
  const hasGrandfather = heirs.grandfather && !hasFather; // Grandfather is present and not excluded by father
  const isGrandfatherExcluded = heirs.grandfather && hasFather;

  // Sibling exclusion rules
  // Real sibling excludes paternal and uterine
  const hasRealBrother = heirs.realBrothersCount > 0;
  const hasRealSister = heirs.realSistersCount > 0;
  
  // Real sister can become Asabah with daughters/granddaughters (Asabah Ma'al Ghayr)
  const isRealSisterAsabahMaAlGhayr = (hasDaughter || hasGranddaughter) && !hasSon && !hasGrandson && !hasFather && !hasGrandfather && hasRealSister && heirs.realBrothersCount === 0;

  // Excluded markers
  const excludedHeirs: { [key: string]: { reason: string; by: string } } = {};

  // Define exclusions according to Hanafi Fiqh
  if (hasFather) {
    if (heirs.grandfather) excludedHeirs["grandfather"] = { reason: "والد کی موجودگی میں دادا محروم ہو جاتے ہیں۔", by: "والد" };
    if (heirs.grandmotherPaternal) excludedHeirs["grandmotherPaternal"] = { reason: "والد کی موجودگی میں دادی محروم ہو جاتی ہے۔", by: "والد" };
    
    // Father excludes brothers and sisters (all kinds: real, paternal, uterine)
    if (heirs.realBrothersCount > 0) excludedHeirs["realBrothers"] = { reason: "والد کی موجودگی میں حقیقی بھائی محروم ہو جاتے ہیں۔", by: "والد" };
    if (heirs.realSistersCount > 0) excludedHeirs["realSisters"] = { reason: "والد کی موجودگی میں حقیقی بہنیں محروم ہو جاتی ہیں۔", by: "والد" };
    if (heirs.paternalBrothersCount > 0) excludedHeirs["paternalBrothers"] = { reason: "والد کی موجودگی میں علاتی بھائی محروم ہو جاتے ہیں۔", by: "والد" };
    if (heirs.paternalSistersCount > 0) excludedHeirs["paternalSisters"] = { reason: "والد کی موجودگی میں علاتی بہنیں محروم ہو جاتی ہیں۔", by: "والد" };
    if (heirs.uterineBrothersCount > 0) excludedHeirs["uterineBrothers"] = { reason: "والد کی موجودگی میں اخیافی بھائی محروم ہو جاتے ہیں۔", by: "والد" };
    if (heirs.uterineSistersCount > 0) excludedHeirs["uterineSisters"] = { reason: "والد کی موجودگی میں اخیافی بہنیں محروم ہو جاتی ہیں۔", by: "والد" };
    if (heirs.unclesCount > 0) excludedHeirs["uncles"] = { reason: "والد کی موجودگی میں حقیقی چچا محروم ہو جاتے ہیں۔", by: "والد" };
  }

  // Grandfather excludes brothers/sisters in standard Hanafi Fatwa (Abu Hanifa's opinion)
  if (hasGrandfather && !hasFather) {
    if (heirs.realBrothersCount > 0) excludedHeirs["realBrothers"] = { reason: "دادا کی موجودگی میں حقیقی بھائی محروم ہو جاتے ہیں (امام ابو حنیفہ رح کے قول کے مطابق)۔", by: "دادا" };
    if (heirs.realSistersCount > 0) excludedHeirs["realSisters"] = { reason: "دادا کی موجودگی میں حقیقی بہنیں محروم ہو جاتی ہیں (امام ابو حنیفہ رح کے قول کے مطابق)۔", by: "دادا" };
    if (heirs.paternalBrothersCount > 0) excludedHeirs["paternalBrothers"] = { reason: "دادا کی موجودگی میں علاتی بھائی محروم ہو جاتے ہیں۔", by: "دادا" };
    if (heirs.paternalSistersCount > 0) excludedHeirs["paternalSisters"] = { reason: "دادا کی موجودگی میں علاتی بہنیں محروم ہو جاتی ہیں۔", by: "دادا" };
    if (heirs.uterineBrothersCount > 0) excludedHeirs["uterineBrothers"] = { reason: "دادا کی موجودگی میں اخیافی بھائی محروم ہو جاتے ہیں۔", by: "دادا" };
    if (heirs.uterineSistersCount > 0) excludedHeirs["uterineSisters"] = { reason: "دادا کی موجودگی میں اخیافی بہنیں محروم ہو جاتی ہیں۔", by: "دادا" };
    if (heirs.unclesCount > 0) excludedHeirs["uncles"] = { reason: "دادا کی موجودگی میں حقیقی چچا محروم ہو جاتے ہیں۔", by: "دادا" };
  }

  if (hasMother) {
    // Mother excludes paternal and maternal grandmother
    if (heirs.grandmotherPaternal) excludedHeirs["grandmotherPaternal"] = { reason: "والدہ کی موجودگی میں دادی محروم ہو جاتی ہے۔", by: "والدہ" };
    if (heirs.grandmotherMaternal) excludedHeirs["grandmotherMaternal"] = { reason: "والدہ کی موجودگی میں نانی محروم ہو جاتی ہے۔", by: "والدہ" };
  }

  if (hasSon) {
    // Son excludes grandsons and granddaughters
    if (heirs.grandsonsCount > 0) excludedHeirs["grandsons"] = { reason: "بیٹے کی موجودگی میں پوتے محروم ہو جاتے ہیں۔", by: "بیٹا" };
    if (heirs.granddaughtersCount > 0) excludedHeirs["granddaughters"] = { reason: "بیٹے کی موجودگی میں پوتیاں محروم ہو جاتی ہیں۔", by: "بیٹا" };
    
    // Son excludes siblings of all kinds
    if (heirs.realBrothersCount > 0) excludedHeirs["realBrothers"] = { reason: "بیٹے کی موجودگی میں حقیقی بھائی محروم ہو جاتے ہیں۔", by: "بیٹا" };
    if (heirs.realSistersCount > 0) excludedHeirs["realSisters"] = { reason: "بیٹے کی موجودگی میں حقیقی بہنیں محروم ہو جاتی ہیں۔", by: "بیٹا" };
    if (heirs.paternalBrothersCount > 0) excludedHeirs["paternalBrothers"] = { reason: "بیٹے کی موجودگی میں علاتی بھائی محروم ہو جاتے ہیں۔", by: "بیٹا" };
    if (heirs.paternalSistersCount > 0) excludedHeirs["paternalSisters"] = { reason: "بیٹے کی موجودگی میں علاتی بہنیں محروم ہو جاتی ہیں۔", by: "بیٹا" };
    if (heirs.uterineBrothersCount > 0) excludedHeirs["uterineBrothers"] = { reason: "بیٹے کی موجودگی میں اخیافی بھائی محروم ہو جاتے ہیں۔", by: "بیٹا" };
    if (heirs.uterineSistersCount > 0) excludedHeirs["uterineSisters"] = { reason: "بیٹے کی موجودگی میں اخیافی بہنیں محروم ہو جاتی ہیں۔", by: "بیٹا" };
    if (heirs.unclesCount > 0) excludedHeirs["uncles"] = { reason: "بیٹے کی موجودگی میں حقیقی چچا محروم ہو جاتے ہیں۔", by: "بیٹا" };
  }

  if (hasGrandson && !hasSon) {
    // Grandson excludes further descendants and siblings
    if (heirs.realBrothersCount > 0) excludedHeirs["realBrothers"] = { reason: "پوتے کی موجودگی میں حقیقی بھائی محروم ہو جاتے ہیں۔", by: "پوتا" };
    if (heirs.realSistersCount > 0) excludedHeirs["realSisters"] = { reason: "پوتے کی موجودگی میں حقیقی بہنیں محروم ہو جاتی ہیں۔", by: "پوتا" };
    if (heirs.paternalBrothersCount > 0) excludedHeirs["paternalBrothers"] = { reason: "پوتے کی موجودگی میں علاتی بھائی محروم ہو جاتے ہیں۔", by: "پوتا" };
    if (heirs.paternalSistersCount > 0) excludedHeirs["paternalSisters"] = { reason: "پوتے کی موجودگی میں علاتی بہنیں محروم ہو جاتی ہیں۔", by: "پوتا" };
    if (heirs.uterineBrothersCount > 0) excludedHeirs["uterineBrothers"] = { reason: "پوتے کی موجودگی میں اخیافی بھائی محروم ہو جاتے ہیں۔", by: "پوتا" };
    if (heirs.uterineSistersCount > 0) excludedHeirs["uterineSisters"] = { reason: "پوتے کی موجودگی میں اخیافی بہنیں محروم ہو جاتی ہیں۔", by: "پوتا" };
    if (heirs.unclesCount > 0) excludedHeirs["uncles"] = { reason: "پوتے کی موجودگی میں حقیقی چچا محروم ہو جاتے ہیں۔", by: "پوتا" };
  }

  // Uterine siblings excluded by any child/grandchild or male ancestor
  const hasDescendant = hasSon || hasDaughter || hasGrandson || hasGranddaughter;
  const hasMaleAncestor = hasFather || hasGrandfather;
  if (hasDescendant || hasMaleAncestor) {
    if (heirs.uterineBrothersCount > 0) excludedHeirs["uterineBrothers"] = { reason: "اولاد، پوتے پوتی، والد یا دادا کی موجودگی میں اخیافی بھائی محروم ہو جاتے ہیں۔", by: "فروع یا اصولِ مذکر" };
    if (heirs.uterineSistersCount > 0) excludedHeirs["uterineSisters"] = { reason: "اولاد، پوتے پوتی، والد یا دادا کی موجودگی میں اخیافی بہنیں محروم ہو جاتی ہیں۔", by: "فروع یا اصولِ مذکر" };
  }

  // Daughter excludes granddaughter if daughter count >= 2, unless there is a grandson (پوتا) to make them Asabah
  if (heirs.daughtersCount >= 2 && !hasSon && !hasGrandson) {
    if (heirs.granddaughtersCount > 0) excludedHeirs["granddaughters"] = { reason: "دو یا زائد بیٹیوں کی موجودگی میں پوتیاں محروم ہو جاتی ہیں (جب تک پوتا موجود نہ ہو)۔", by: "بیٹیاں" };
  }

  // Real brothers/sisters exclude paternal siblings and uncles
  if (hasRealBrother || isRealSisterAsabahMaAlGhayr) {
    if (heirs.paternalBrothersCount > 0) excludedHeirs["paternalBrothers"] = { reason: "حقیقی بھائی یا بہن (جب وہ عصبہ ہو) کی موجودگی میں علاتی بھائی محروم ہو جاتے ہیں۔", by: "حقیقی بھائی/بہن" };
    if (heirs.paternalSistersCount > 0) excludedHeirs["paternalSisters"] = { reason: "حقیقی بھائی یا بہن (جب وہ عصبہ ہو) کی موجودگی میں علاتی بہنیں محروم ہو جاتی ہیں۔", by: "حقیقی بھائی/بہن" };
  }

  if (hasRealBrother) {
    if (heirs.unclesCount > 0) excludedHeirs["uncles"] = { reason: "حقیقی بھائی کی موجودگی میں حقیقی چچا محروم ہو جاتے ہیں۔", by: "حقیقی بھائی" };
  }

  // Real sister excludes paternal sisters if real sister count >= 2, unless paternal brother is present
  if (heirs.realSistersCount >= 2 && heirs.paternalBrothersCount === 0) {
    if (heirs.paternalSistersCount > 0) excludedHeirs["paternalSisters"] = { reason: "دو یا زائد حقیقی بہنوں کی موجودگی میں علاتی بہنیں محروم ہو جاتی ہیں۔", by: "حقیقی بہنیں" };
  }

  // Consanguine brothers/sisters exclude uncles
  const hasPaternalBrother = heirs.paternalBrothersCount > 0;
  if (hasPaternalBrother) {
    if (heirs.unclesCount > 0) excludedHeirs["uncles"] = { reason: "علاتی بھائی کی موجودگی میں چچا محروم ہو جاتے ہیں۔", by: "علاتی بھائی" };
  }

  // Calculate Zawil Furuz Shares (اصحاب الفروض)
  const baseShares: { [key: string]: number } = {};
  const reasons: { [key: string]: string } = {};

  // 1. Husband shares
  if (hasHusband) {
    const hasChildrenOrGrandchildren = hasSon || hasDaughter || hasGrandson || hasGranddaughter;
    if (hasChildrenOrGrandchildren) {
      baseShares["husband"] = 1 / 4;
      reasons["husband"] = "اولاد یا پوتے پوتی کی موجودگی کی وجہ سے شوہر کا حصہ 1/4 (چوتھائی) ہے۔";
    } else {
      baseShares["husband"] = 1 / 2;
      reasons["husband"] = "اولاد یا پوتے پوتی کی عدم موجودگی کی وجہ سے شوہر کا حصہ 1/2 (نصف) ہے۔";
    }
  }

  // 2. Wife/Wives shares (Shared equally if multiple)
  if (hasWife) {
    const hasChildrenOrGrandchildren = hasSon || hasDaughter || hasGrandson || hasGranddaughter;
    const baseShare = hasChildrenOrGrandchildren ? 1 / 8 : 1 / 4;
    baseShares["wife"] = baseShare;
    const shareText = hasChildrenOrGrandchildren ? "1/8" : "1/4";
    if (heirs.wivesCount > 1) {
      reasons["wife"] = `اولاد یا پوتے پوتی کی ${hasChildrenOrGrandchildren ? "موجودگی" : "عدم موجودگی"} کی وجہ سے بیویوں کا مجموعی حصہ ${shareText} ہے، جو ان کے درمیان برابر تقسیم ہوگا۔`;
    } else {
      reasons["wife"] = `اولاد یا پوتے پوتی کی ${hasChildrenOrGrandchildren ? "موجودگی" : "عدم موجودگی"} کی وجہ سے بیوی کا حصہ ${shareText} ہے۔`;
    }
  }

  // 3. Father shares (Zawil Furuz part, Father can also be Asabah)
  let fatherAsZawilFuruz = false;
  let fatherAsAsabah = false;
  let fatherShare = 0;

  if (hasFather) {
    const hasMaleDescendant = hasSon || hasGrandson;
    const hasFemaleDescendantOnly = (hasDaughter || hasGranddaughter) && !hasSon && !hasGrandson;

    if (hasMaleDescendant) {
      fatherShare = 1 / 6;
      baseShares["father"] = 1 / 6;
      fatherAsZawilFuruz = true;
      reasons["father"] = "مذکر اولاد (بیٹا یا پوتا) کی موجودگی کی وجہ سے والد کا متعین حصہ 1/6 ہے۔";
    } else if (hasFemaleDescendantOnly) {
      fatherShare = 1 / 6;
      baseShares["father"] = 1 / 6;
      fatherAsZawilFuruz = true; // Gets 1/6 as Zawil Furuz and also takes the remainder as Asabah
      fatherAsAsabah = true;
      reasons["father"] = "صرف مؤنث اولاد (بیٹی یا پوتی) کی موجودگی کی وجہ سے والد کو 1/6 بطور فرض ملے گا اور وہ عصبہ بن کر بچا ہوا مال بھی لیں گے۔";
    } else {
      // No offspring
      fatherAsAsabah = true;
      reasons["father"] = "اولاد کی عدم موجودگی کی وجہ سے والد عصبہ بنتے ہیں اور اصحاب الفروض کے حصوں سے بچا ہوا تمام مال حاصل کرتے ہیں۔";
    }
  }

  // 4. Mother shares
  if (hasMother) {
    const hasDescendants = hasSon || hasDaughter || hasGrandson || hasGranddaughter;
    
    // Siblings count
    const totalSiblingsCount = 
      heirs.realBrothersCount + 
      heirs.realSistersCount + 
      heirs.paternalBrothersCount + 
      heirs.paternalSistersCount + 
      heirs.uterineBrothersCount + 
      heirs.uterineSistersCount;

    const hasMultipleSiblings = totalSiblingsCount >= 2;

    if (hasDescendants || hasMultipleSiblings) {
      baseShares["mother"] = 1 / 6;
      reasons["mother"] = `میت کی اولاد یا دو یا زائد بہن بھائیوں کی موجودگی کی وجہ سے والدہ کا حصہ 1/6 ہے۔`;
    } else {
      // Check for Umariyya cases (زوجین مع الابوین: Spouse + Father + Mother)
      const hasOnlySpouseAndParents = (hasHusband || hasWife) && hasFather && !hasDescendants && totalSiblingsCount === 0;
      if (hasOnlySpouseAndParents) {
        baseShares["mother"] = 1 / 3; // In final, mother gets 1/3 of the Remainder after spouse
        reasons["mother"] = "مسئلہ عمر یہ (زوجین اور والدین) کی وجہ سے، شوہر/بیوی کا حصہ نکالنے کے بعد والدہ کو باقی ترکے کا ایک تہائی (1/3) ملے گا۔";
      } else {
        baseShares["mother"] = 1 / 3;
        reasons["mother"] = "اولاد اور بہن بھائیوں کی عدم موجودگی کی وجہ سے والدہ کو کل ترکے کا 1/3 حصہ ملے گا۔";
      }
    }
  }

  // 5. Grandfather shares (Zawil Furuz part, Dad can also be Asabah if Father is absent)
  let grandfatherAsZawilFuruz = false;
  let grandfatherAsAsabah = false;
  let grandfatherShare = 0;

  if (hasGrandfather && !excludedHeirs["grandfather"]) {
    const hasMaleDescendant = hasSon || hasGrandson;
    const hasFemaleDescendantOnly = (hasDaughter || hasGranddaughter) && !hasSon && !hasGrandson;

    if (hasMaleDescendant) {
      grandfatherShare = 1 / 6;
      baseShares["grandfather"] = 1 / 6;
      grandfatherAsZawilFuruz = true;
      reasons["grandfather"] = "مذکر اولاد کی موجودگی اور والد کی عدم موجودگی کی وجہ سے دادا کا حصہ 1/6 ہے۔";
    } else if (hasFemaleDescendantOnly) {
      grandfatherShare = 1 / 6;
      baseShares["grandfather"] = 1 / 6;
      grandfatherAsZawilFuruz = true;
      grandfatherAsAsabah = true;
      reasons["grandfather"] = "صرف مؤنث اولاد کی موجودگی اور والد کی عدم موجودگی کی وجہ سے دادا کو 1/6 حصہ بطور فرض ملے گا اور عصبہ بن کر بقیہ بھی لیں گے۔";
    } else {
      grandfatherAsAsabah = true;
      reasons["grandfather"] = "اولاد اور والد کی عدم موجودگی کی وجہ سے دادا عصبہ بنیں گے اور بقیہ یا کل ترکہ لیں گے۔";
    }
  }

  // 6. Grandmother (Dadi, Nani) shares
  const activeDadi = heirs.grandmotherPaternal && !excludedHeirs["grandmotherPaternal"];
  const activeNani = heirs.grandmotherMaternal && !excludedHeirs["grandmotherMaternal"];
  
  if (activeDadi || activeNani) {
    const grandmotherSharedShare = 1 / 6;
    if (activeDadi && activeNani) {
      baseShares["grandmotherPaternal"] = 1 / 12;
      baseShares["grandmotherMaternal"] = 1 / 12;
      reasons["grandmotherPaternal"] = "دادی اور نانی دونوں موجود ہیں، اس لیے وہ 1/6 حصہ برابر آپس میں تقسیم کریں گی (ہر ایک کا حصہ 1/12)۔";
      reasons["grandmotherMaternal"] = "نانی اور دادی دونوں موجود ہیں، اس لیے وہ 1/6 حصہ برابر آپس میں تقسیم کریں گی (ہر ایک کا حصہ 1/12)۔";
    } else if (activeDadi) {
      baseShares["grandmotherPaternal"] = 1 / 6;
      reasons["grandmotherPaternal"] = "والد، والدہ اور قریبی نانی کی عدم موجودگی کی وجہ سے دادی کا حصہ 1/6 ہے۔";
    } else if (activeNani) {
      baseShares["grandmotherMaternal"] = 1 / 6;
      reasons["grandmotherMaternal"] = "والدہ کی عدم موجودگی کی وجہ سے نانی کا حصہ 1/6 ہے۔";
    }
  }

  // 7. Daughters shares (Zawil Furuz part, can be Asabah Bil Ghayr if Son is present)
  let daughtersAsZawilFuruz = false;
  let daughtersAsAsabah = false;
  if (heirs.daughtersCount > 0) {
    if (hasSon) {
      daughtersAsAsabah = true; // Becomes Asabah with Son
      reasons["daughter"] = "بیٹے کی موجودگی کی وجہ سے بیٹیاں عصبہ بالغیر بن کر بیٹے کے ساتھ 1:2 کے تناسب سے پسماندہ ترکہ تقسیم کریں گی۔";
    } else {
      daughtersAsZawilFuruz = true;
      if (heirs.daughtersCount === 1) {
        baseShares["daughter"] = 1 / 2;
        reasons["daughter"] = "بیٹے کی عدم موجودگی میں ایک اکلوتی بیٹی کا متعین حصہ 1/2 (نصف) ہے۔";
      } else {
        baseShares["daughter"] = 2 / 3; // Shared among all daughters
        reasons["daughter"] = `بیٹے کی عدم موجودگی میں دو یا زائد بیٹیوں کا مجموعی حصہ 2/3 ہے جو ان میں برابر تقسیم ہوگا۔`;
      }
    }
  }

  // 8. Granddaughters (Poutiyan) shares (Zawil Furuz part, can be Asabah Bil Ghayr with Grandson)
  let granddaughtersAsZawilFuruz = false;
  let granddaughtersAsAsabah = false;
  if (heirs.granddaughtersCount > 0 && !excludedHeirs["granddaughters"]) {
    if (hasGrandson) {
      granddaughtersAsAsabah = true;
      reasons["granddaughter"] = "پوتے کی موجودگی کی وجہ سے پوتیاں عصبہ بنتی ہیں اور پوتے کے ساتھ 2:1 کے تناسب سے تقسیم کریں گی۔";
    } else {
      // No grandson and no son
      if (heirs.daughtersCount === 0) {
        // True daughters absent, granddaughter takes their place
        granddaughtersAsZawilFuruz = true;
        if (heirs.granddaughtersCount === 1) {
          baseShares["granddaughter"] = 1 / 2;
          reasons["granddaughter"] = "میت کی کوئی حقیقی اولاد نہ ہونے کی صورت میں ایک پوتی کا حصہ 1/2 ہے۔";
        } else {
          baseShares["granddaughter"] = 2 / 3;
          reasons["granddaughter"] = `میت کی حقیقی اولاد نہ ہونے کی صورت میں پوتیاں کثرت کی وجہ سے مجموعی طور پر 2/3 کی حقدار ہیں جو ان میں برابر تقسیم ہوگا۔`;
        }
      } else if (heirs.daughtersCount === 1) {
        // One true daughter, granddaughter gets 1/6 (تکملہ الثلثین - completing 2/3)
        granddaughtersAsZawilFuruz = true;
        baseShares["granddaughter"] = 1 / 6;
        if (heirs.granddaughtersCount === 1) {
          reasons["granddaughter"] = "ایک حقیقی بیٹی کی موجودگی میں پوتی کا حصہ 1/6 ہے تا کہ مجموعی مؤنث اولاد کا حصہ 2/3 مکمل ہو جائے۔";
        } else {
          reasons["granddaughter"] = `ایک حقیقی بیٹی کی موجودگی میں پوتیوں کا مجموعی حصہ 1/6 ہے جو ان کے درمیان برابر تقسیم ہوگا تا کہ مؤنث اولاد کا حصہ 2/3 مکمل ہو جائے۔`;
        }
      }
    }
  }

  // 9. Real Sisters shares (Zawil Furuz part, can be Asabah Bil Ghayr if Real Brother exists, or Asabah Ma'al Ghayr if daughters exist)
  let realSistersAsZawilFuruz = false;
  let realSistersAsAsabah = false;
  const activeRealSister = heirs.realSistersCount > 0 && !excludedHeirs["realSisters"];
  
  if (activeRealSister) {
    if (hasRealBrother) {
      realSistersAsAsabah = true;
      reasons["realSister"] = "حقیقی بھائی کی موجودگی کی وجہ سے حقیقی بہنیں عصبہ بالغیر بن جاتی ہیں اور ان میں 2:1 کے تناسب سے بچا ہوا ترکہ تقسیم ہوگا۔";
    } else if (hasDaughter || hasGranddaughter) {
      // Asabah Ma'al Ghayr ("اجعلوا الأخوات مع البنات عصبة")
      realSistersAsAsabah = true;
      reasons["realSister"] = "میت کی بیٹی یا پوتیوں کی موجودگی کی وجہ سے حقیقی بہنیں عصبہ مع الغیر بن کر اصحاب الفروض کا حصہ نکالنے کے بعد بقیہ ترکہ حاصل کریں گی۔";
    } else {
      realSistersAsZawilFuruz = true;
      if (heirs.realSistersCount === 1) {
        baseShares["realSister"] = 1 / 2;
        reasons["realSister"] = "اصول و فروع کے نہ ہونے کی وجہ سے ایک حقیقی بہن کا حصہ 1/2 (نصف) ہے۔";
      } else {
        baseShares["realSister"] = 2 / 3;
        reasons["realSister"] = `اصول و فروع کے نہ ہونے کی وجہ سے دو یا زائد حقیقی بہنوں کا مجموعی حصہ 2/3 ہے جو برابر تقسیم ہوگا۔`;
      }
    }
  }

  // 10. Consanguine (Paternal) Sisters (علاتی بہنیں) shares (Zawil Furuz part, or Asabah with Paternal Brother/Daughters)
  let paternalSistersAsZawilFuruz = false;
  let paternalSistersAsAsabah = false;
  const activePaternalSister = heirs.paternalSistersCount > 0 && !excludedHeirs["paternalSisters"];

  if (activePaternalSister) {
    if (hasPaternalBrother) {
      paternalSistersAsAsabah = true;
      reasons["paternalSister"] = "علاتی بھائی کی موجودگی میں علاتی بہنیں عصبہ بن کر بھائی کے ساتھ 2:1 کے تناسب سے تقسیم کریں گی۔";
    } else if (hasDaughter || hasGranddaughter) {
      // Becomes Asabah Ma'al Ghayr unless excluded by real sister
      paternalSistersAsAsabah = true;
      reasons["paternalSister"] = "حقیقی بھائی بہنوں کی عدم موجودگی اور بیٹیوں کی موجودگی میں علاتی بہنیں عصبہ مع الغیر بنتی ہیں۔";
    } else {
      // Zawil Furuz cases
      if (!hasRealSister && heirs.realSistersCount === 0) {
        paternalSistersAsZawilFuruz = true;
        if (heirs.paternalSistersCount === 1) {
          baseShares["paternalSister"] = 1 / 2;
          reasons["paternalSister"] = "حقیقی بہن بھائیوں اور اولاد کے نہ ہونے پر ایک علاتی بہن کا حصہ 1/2 ہے۔";
        } else {
          baseShares["paternalSister"] = 2 / 3;
          reasons["paternalSister"] = `حقیقی بہن بھائیوں اور اولاد کے نہ ہونے پر علاتی بہنوں کا مجموعی حصہ 2/3 ہے جو برابر تقسیم ہوگا۔`;
        }
      } else if (heirs.realSistersCount === 1) {
        // One real sister, paternal sister gets 1/6 (completing 2/3)
        paternalSistersAsZawilFuruz = true;
        baseShares["paternalSister"] = 1 / 6;
        if (heirs.paternalSistersCount === 1) {
          reasons["paternalSister"] = "ایک حقیقی بہن کی موجودگی میں علاتی بہن کا حصہ 1/6 ہے تا کہ بہنوں کا مجموعی 2/3 پورہ ہو جائے (تکملہ الثلثین)۔";
        } else {
          reasons["paternalSister"] = `ایک حقیقی بہن کی موجودگی میں علاتی بہنوں کا مجموعی حصہ 1/6 ہے جو برابر تقسیم ہوگا تا کہ بہنوں کا مجموعی 2/3 پورہ ہو جائے۔`;
        }
      }
    }
  }

  // 11. Uterine (Maternal) Brothers/Sisters (اخیافی بہن بھائی) shares
  const activeUterineBrother = heirs.uterineBrothersCount > 0 && !excludedHeirs["uterineBrothers"];
  const activeUterineSister = heirs.uterineSistersCount > 0 && !excludedHeirs["uterineSisters"];
  const totalUterineSiblings = (activeUterineBrother ? heirs.uterineBrothersCount : 0) + (activeUterineSister ? heirs.uterineSistersCount : 0);

  if (totalUterineSiblings > 0) {
    if (totalUterineSiblings === 1) {
      const parentKey = activeUterineBrother ? "uterineBrother" : "uterineSister";
      baseShares[parentKey] = 1 / 6;
      reasons[parentKey] = "اولاد اور اصولِ مذکر (والد/دادا) کی عدم موجودگی میں ایک اکلوتے اخیافی بھائی/بہن کا حصہ 1/6 ہے۔";
    } else {
      // Shared equally, males and females get identical shares (unlike standard 2:1)
      const sharePerSibling = (1 / 3) / totalUterineSiblings;
      if (activeUterineBrother) {
        baseShares["uterineBrother"] = sharePerSibling * heirs.uterineBrothersCount;
        reasons["uterineBrother"] = `دو یا زائد اخیافی بہن بھائیوں کا مجموعی حصہ 1/3 ہوتا ہے۔ فقہ حنفی میں مذکر و مؤنث اخیافی برابر کے شریک ہوتے ہیں، پس یہ حصہ سب میں برابر تقسیم ہوگا۔`;
      }
      if (activeUterineSister) {
        baseShares["uterineSister"] = sharePerSibling * heirs.uterineSistersCount;
        reasons["uterineSister"] = `دو یا زائد اخیافی بہن بھائیوں کا مجموعی حصہ 1/3 ہوتا ہے۔ فقہ حنفی میں مذکر و مؤنث اخیافی برابر کے شریک ہوتے ہیں، پس یہ حصہ سب میں برابر تقسیم ہوگا۔`;
      }
    }
  }

  // Handle special case: Umariyya (Gharrawain) adjustment for Mother
  // If Mother gets 1/3, but it's the Umariyya case (Father + Mother + Husband/Wife, no children, no siblings), 
  // Mother gets 1/3 of the REMAINDER after spouse.
  let isUmariyyaCase = false;
  let motherUmariyyaAdjustmentFraction = 0;
  if (hasMother && hasFather && (hasHusband || hasWife) && !hasDescendant) {
    const totalSiblingsCount = 
      heirs.realBrothersCount + 
      heirs.realSistersCount + 
      heirs.paternalBrothersCount + 
      heirs.paternalSistersCount + 
      heirs.uterineBrothersCount + 
      heirs.uterineSistersCount;
    if (totalSiblingsCount === 0) {
      isUmariyyaCase = true;
    }
  }

  // Sum of Zawil Furuz base shares
  let zfSum = 0;
  for (const key of Object.keys(baseShares)) {
    // Exclude special mother in calculations if Umariyya applies
    if (key === "mother" && isUmariyyaCase) continue;
    zfSum += baseShares[key];
  }

  // If Umariyya applies: Mother share is 1/3 of remainder
  if (isUmariyyaCase) {
    const spouseShare = baseShares["husband"] || baseShares["wife"] || 0;
    const remainder = 1 - spouseShare;
    motherUmariyyaAdjustmentFraction = remainder / 3;
    baseShares["mother"] = motherUmariyyaAdjustmentFraction;
    zfSum += motherUmariyyaAdjustmentFraction;
  }

  // Check if there are Asabah (Residuaries) present
  const activeSons = heirs.sonsCount > 0;
  const activeGrandsons = heirs.grandsonsCount > 0 && !excludedHeirs["grandsons"];
  const activeRealBrothers = heirs.realBrothersCount > 0 && !excludedHeirs["realBrothers"];
  const activePaternalBrothers = heirs.paternalBrothersCount > 0 && !excludedHeirs["paternalBrothers"];
  const activeUncles = heirs.unclesCount > 0 && !excludedHeirs["uncles"];

  const hasAsabahPresent = 
    activeSons || 
    activeGrandsons || 
    (hasFather && fatherAsAsabah) || 
    (hasGrandfather && grandfatherAsAsabah) || 
    activeRealBrothers || 
    isRealSisterAsabahMaAlGhayr || 
    activePaternalBrothers || 
    activePaternalSister && paternalSistersAsAsabah || // sister can also be asabah with brother
    activeUncles;

  // Determination of Rule to Apply: normal, awl, or radd
  let appliedRule: "normal" | "awl" | "radd" = "normal";
  let finalShares: { [key: string]: number } = { ...baseShares };
  let appliedAwlTotal = 0;

  // Let's print for debugging or tracking
  const zfExactPercentSum = zfSum;

  if (zfSum > 1.0001) {
    // Al-Awl Rule (عول)
    appliedRule = "awl";
    appliedAwlTotal = zfSum;
    // Scale everything down of Zawil Furuz proportionally so that they sum to exactly 1.0
    for (const key of Object.keys(baseShares)) {
      finalShares[key] = baseShares[key] / zfSum;
    }
  } else if (zfSum < 0.9999 && !hasAsabahPresent) {
    // Ar-Radd Rule (رد)
    appliedRule = "radd";
    
    // Check if there are other Zawil Furuz besides Husband/Wife to return to
    const hasOtherZfThanSpouse = Object.keys(baseShares).some(key => key !== "husband" && key !== "wife" && baseShares[key] > 0);
    
    if (hasOtherZfThanSpouse) {
      // Return on non-spouse heirs
      const spouseKey = hasHusband ? "husband" : hasWife ? "wife" : null;
      let spouseBaseShare = 0;
      if (spouseKey) {
        spouseBaseShare = baseShares[spouseKey];
        finalShares[spouseKey] = spouseBaseShare; // Spouse gets exact share, no Radd
      }

      const netZfSumExcludingSpouse = zfSum - spouseBaseShare;
      const RaddRemainder = 1 - spouseBaseShare;

      for (const key of Object.keys(baseShares)) {
        if (key !== "husband" && key !== "wife") {
          // Non-spouse gets proportional share of the rest
          finalShares[key] = (baseShares[key] / netZfSumExcludingSpouse) * RaddRemainder;
          reasons[key] += " (رد کی وجہ سے حصہ کی مقدار میں اضافہ ہوا ہے)۔";
        }
      }
    } else {
      // No other Zawil Furuz, only Husband or Wife. 
      // Return on husband/wife! (This is modern legal/fatwa standard when treasury isn't organized)
      const spouseKey = hasHusband ? "husband" : hasWife ? "wife" : null;
      if (spouseKey) {
        finalShares[spouseKey] = 1.0;
        reasons[spouseKey] += " (میت کا کوئی اور وارث نہ ہونے کی وجہ سے پورا ترکہ رد کے تحت شوہر/بیوی کو ملتا ہے)۔";
      }
    }
  } else {
    // Normal cases, has Asabah or perfect balance
    appliedRule = "normal";
  }

  // If there's remainder and there is Asabah, distribute remainder to Asabah
  let remainingForAsabah = 0;
  if (appliedRule === "normal") {
    remainingForAsabah = Math.max(0, 1 - zfSum);
  }

  // Distribute Asabah portion among running Asabat in order of priority:
  // 1. Son and Daughter (Asabah Bil Ghayr, 2:1 ratio)
  // 2. Grandson and Granddaughter (Asabah Bil Ghayr, 2:1 ratio)
  // 3. Father (alone as Asabah)
  // 4. Grandfather (alone as Asabah)
  // 5. Brothers and Sisters (Real, 2:1 ratio, or Sisters Ma'al Ghayr playing the brother's role)
  // 6. Paternal Brothers and Paternal Sisters (2:1 ratio)
  // 7. Paternal Uncles (heirs.unclesCount, equal shares)

  const activeAsabatShares: { [key: string]: number } = {};

  if (remainingForAsabah > 0.00001 && hasAsabahPresent) {
    if (activeSons) {
      // 1. Sons and Daughters
      const sonsShareWeight = heirs.sonsCount * 2;
      const daughtersShareWeight = heirs.daughtersCount * 1;
      const totalWeight = sonsShareWeight + daughtersShareWeight;
      
      const sharePerDaughter = remainingForAsabah / totalWeight;
      const sharePerSon = sharePerDaughter * 2;

      baseShares["son"] = sharePerSon * heirs.sonsCount;
      baseShares["daughter"] = (baseShares["daughter"] || 0) + (sharePerDaughter * heirs.daughtersCount);

      finalShares["son"] = sharePerSon * heirs.sonsCount;
      finalShares["daughter"] = (finalShares["daughter"] || 0) + (sharePerDaughter * heirs.daughtersCount);

      reasons["son"] = `عصبہ ہونے کی وجہ سے بیٹا بقیہ ترکہ حاصل کرے گا۔ ہر بیٹے کو بیٹی کے مقابلے میں دوگنا (2:1) حصہ ملے گا۔`;
      if (heirs.daughtersCount > 0) {
        reasons["daughter"] = `بیٹے کی موجودگی میں بیٹیاں عصبہ بالغیر بن جاتی ہیں اور بقیہ ترکے سے 2:1 کے تناسب سے شریک ہوتی ہیں۔`;
      }
    } else if (activeGrandsons) {
      // 2. Grandsons and Granddaughters
      const grandsonWeight = heirs.grandsonsCount * 2;
      const granddaughterWeight = heirs.granddaughtersCount * 1;
      const totalWeight = grandsonWeight + granddaughterWeight;

      const sharePerGranddaughter = remainingForAsabah / totalWeight;
      const sharePerGrandson = sharePerGranddaughter * 2;

      baseShares["grandson"] = sharePerGrandson * heirs.grandsonsCount;
      baseShares["granddaughter"] = (baseShares["granddaughter"] || 0) + (sharePerGranddaughter * heirs.granddaughtersCount);

      finalShares["grandson"] = sharePerGrandson * heirs.grandsonsCount;
      finalShares["granddaughter"] = (finalShares["granddaughter"] || 0) + (sharePerGranddaughter * heirs.granddaughtersCount);

      reasons["grandson"] = `پوتے عصبہ بن چکے ہیں۔ ہر پوتے کو پوتی سے دوگنا (2:1) حصہ ملے گا۔`;
      if (heirs.granddaughtersCount > 0) {
        reasons["granddaughter"] = `پوتے کی موجودگی میں پوتیاں عصبہ بن کر بقیہ ترکے میں 2:1 کے تناسب حاصل کریں گی۔`;
      }
    } else if (hasFather && fatherAsAsabah) {
      // 3. Father
      baseShares["father"] = (baseShares["father"] || 0) + remainingForAsabah;
      finalShares["father"] = (finalShares["father"] || 0) + remainingForAsabah;
      reasons["father"] = `والد عصبہ ہونے کی وجہ سے تمام بقیہ ترکہ (${(remainingForAsabah * 100).toFixed(1)}%) حاصل کریں گے۔`;
    } else if (hasGrandfather && grandfatherAsAsabah) {
      // 4. Grandfather
      baseShares["grandfather"] = (baseShares["grandfather"] || 0) + remainingForAsabah;
      finalShares["grandfather"] = (finalShares["grandfather"] || 0) + remainingForAsabah;
      reasons["grandfather"] = `دادا عصبہ ہونے کی وجہ سے تمام بقیہ ترکہ (${(remainingForAsabah * 100).toFixed(1)}%) حاصل کریں گے۔`;
    } else if (activeRealBrothers || isRealSisterAsabahMaAlGhayr) {
      // 5. Real Brothers and Real Sisters
      const totalBrothersWeight = heirs.realBrothersCount * 2;
      const totalSistersWeight = heirs.realSistersCount * 1; // Real sisters are either Asabah Bil Ghayr or Ma'al Ghayr
      
      const totalWeight = totalBrothersWeight + totalSistersWeight;
      
      if (totalWeight > 0) {
        const unitShare = remainingForAsabah / totalWeight;
        if (heirs.realBrothersCount > 0) {
          baseShares["realBrother"] = unitShare * 2 * heirs.realBrothersCount;
          finalShares["realBrother"] = unitShare * 2 * heirs.realBrothersCount;
          reasons["realBrother"] = `حقیقی بھائی عصبہ بننے کی وجہ سے بچا ہوا ترکہ لیں گے (شیر مکر مثل حظ الانثیین - بہن کے دگنا)۔`;
        }
        if (heirs.realSistersCount > 0) {
          baseShares["realSister"] = (baseShares["realSister"] || 0) + (unitShare * heirs.realSistersCount);
          finalShares["realSister"] = (finalShares["realSister"] || 0) + (unitShare * heirs.realSistersCount);
          if (heirs.realBrothersCount > 0) {
            reasons["realSister"] = `حقیقی بھائی کی موجودگی میں بہن عصبہ بالغیر بنی ہے۔ تناسب 2:1 رہے گا۔`;
          } else {
            reasons["realSister"] = `بیٹی یا پوتی کی موجودگی کی وجہ سے بہن عصبہ مع الغیر بن کر تمام بچا ہوا ترکہ حاصل کر رہی ہے۔`;
          }
        }
      }
    } else if (activePaternalBrothers || (activePaternalSister && paternalSistersAsAsabah)) {
      // 6. Paternal Brothers and Paternal Sisters
      const brotherWeight = heirs.paternalBrothersCount * 2;
      const sisterWeight = heirs.paternalSistersCount * 1;
      const totalWeight = brotherWeight + sisterWeight;

      if (totalWeight > 0) {
        const unitShare = remainingForAsabah / totalWeight;
        if (heirs.paternalBrothersCount > 0) {
          baseShares["paternalBrother"] = unitShare * 2 * heirs.paternalBrothersCount;
          finalShares["paternalBrother"] = unitShare * 2 * heirs.paternalBrothersCount;
          reasons["paternalBrother"] = `علاتی بھائی عصبہ ہونے کے ناطے بقیہ حاصل کریں گے۔`;
        }
        if (heirs.paternalSistersCount > 0) {
          baseShares["paternalSister"] = (baseShares["paternalSister"] || 0) + (unitShare * heirs.paternalSistersCount);
          finalShares["paternalSister"] = (finalShares["paternalSister"] || 0) + (unitShare * heirs.paternalSistersCount);
          reasons["paternalSister"] = `علاتی بھائی کے ساتھ علاتی بہن عصبہ بن گئی ہے۔`;
        }
      }
    } else if (activeUncles) {
      // 7. Uncles
      const sharePerUncle = remainingForAsabah / heirs.unclesCount;
      baseShares["uncle"] = sharePerUncle * heirs.unclesCount;
      finalShares["uncle"] = sharePerUncle * heirs.unclesCount;
      reasons["uncle"] = `اقرب ورثاء کے نہ ہونے پر حقیقی چچا عصبہ بن کر بقیہ حاصل کریں گے۔ تمام چچا میں مساوی تقسیم ہوگی۔`;
    }
  }

  // Compile final heirs results list
  const addHeirToResult = (
    id: string,
    nameUrdu: string,
    nameEnglish: string,
    count: number,
    baseKey: string,
    gender: "M" | "F"
  ) => {
    const isExcluded = excludedHeirs[baseKey] !== undefined;
    const finalFrac = isExcluded ? 0 : (finalShares[baseKey] || 0);
    const baseFrac = isExcluded ? 0 : (baseShares[baseKey] || 0);

    let relationType: "zawil_furuz" | "asabah" | "excluded" = "zawil_furuz";
    if (isExcluded) {
      relationType = "excluded";
    } else if (
      baseKey === "son" ||
      baseKey === "realBrother" ||
      baseKey === "paternalBrother" ||
      baseKey === "uncle" ||
      baseKey === "grandson" ||
      (baseKey === "father" && fatherAsAsabah && !fatherAsZawilFuruz) ||
      (baseKey === "grandfather" && grandfatherAsAsabah && !grandfatherAsZawilFuruz) ||
      (baseKey === "daughter" && daughtersAsAsabah) ||
      (baseKey === "realSister" && realSistersAsAsabah) ||
      (baseKey === "paternalSister" && paternalSistersAsAsabah) ||
      (baseKey === "granddaughter" && granddaughtersAsAsabah)
    ) {
      relationType = "asabah";
    }

    // Fraction Text formatter
    let baseShareText = "";
    if (isExcluded) {
      baseShareText = "محروم (محجوب)";
    } else if (relationType === "asabah" && baseFrac === finalFrac && baseFrac === 0) {
      baseShareText = "محروم";
    } else if (relationType === "asabah") {
      baseShareText = "عصبہ";
    } else {
      baseShareText = getFractionRepresentation(baseShares[baseKey]);
    }

    if (count > 0 || (baseKey === "husband" && heirs.husband) || (baseKey === "father" && heirs.father) || (baseKey === "mother" && heirs.mother) || (baseKey === "grandfather" && heirs.grandfather) || (baseKey === "grandmotherPaternal" && heirs.grandmotherPaternal) || (baseKey === "grandmotherMaternal" && heirs.grandmotherMaternal)) {
      heirsList.push({
        id,
        nameUrdu: count > 1 ? `${nameUrdu} (${count})` : nameUrdu,
        nameEnglish,
        relationType,
        baseShareText,
        baseFraction: baseFrac,
        finalFraction: finalFrac,
        percentage: Number((finalFrac * 100).toFixed(2)),
        amount: Number((finalFrac * netEstate).toFixed(2)),
        reasonUrdu: isExcluded ? excludedHeirs[baseKey].reason : (reasons[baseKey] || "شرعی مقررہ قواعد کے تحت تقسیم۔"),
        isExcluded,
        excludedBy: isExcluded ? excludedHeirs[baseKey].by : undefined
      });
    }
  };

  // Add all tracked heirs
  if (hasHusband) addHeirToResult("husband", "شوہر", "Husband", 1, "husband", "M");
  if (hasWife) addHeirToResult("wife", "بیوی", "Wife", heirs.wivesCount, "wife", "F");
  if (hasFather) addHeirToResult("father", "والد", "Father", 1, "father", "M");
  if (hasMother) addHeirToResult("mother", "والدہ", "Mother", 1, "mother", "F");
  if (heirs.grandfather) addHeirToResult("grandfather", "دادا", "Grandfather", 1, "grandfather", "M");
  if (heirs.grandmotherPaternal) addHeirToResult("grandmotherPaternal", "دادی (باپ کی ماں)", "Paternal Grandmother", 1, "grandmotherPaternal", "F");
  if (heirs.grandmotherMaternal) addHeirToResult("grandmotherMaternal", "نانی (ماں کی ماں)", "Maternal Grandmother", 1, "grandmotherMaternal", "F");
  if (heirs.sonsCount > 0) addHeirToResult("son", "بیٹا", "Son", heirs.sonsCount, "son", "M");
  if (heirs.daughtersCount > 0) addHeirToResult("daughter", "بیٹی", "Daughter", heirs.daughtersCount, "daughter", "F");
  if (heirs.grandsonsCount > 0) addHeirToResult("grandson", "پوتا", "Grandson", heirs.grandsonsCount, "grandson", "M");
  if (heirs.granddaughtersCount > 0) addHeirToResult("granddaughter", "پوتی", "Granddaughter", heirs.granddaughtersCount, "granddaughter", "F");
  if (heirs.realBrothersCount > 0) addHeirToResult("realBrother", "حقیقی بھائی", "Real Brother", heirs.realBrothersCount, "realBrother", "M");
  if (heirs.realSistersCount > 0) addHeirToResult("realSister", "حقیقی بہن", "Real Sister", heirs.realSistersCount, "realSister", "F");
  if (heirs.paternalBrothersCount > 0) addHeirToResult("paternalBrother", "علاتی بھائی", "Paternal Brother", heirs.paternalBrothersCount, "paternalBrother", "M");
  if (heirs.paternalSistersCount > 0) addHeirToResult("paternalSister", "علاتی بہن", "Paternal Sister", heirs.paternalSistersCount, "paternalSister", "F");
  if (heirs.uterineBrothersCount > 0) addHeirToResult("uterineBrother", "اخیافی بھائی", "Uterine Brother", heirs.uterineBrothersCount, "uterineBrother", "M");
  if (heirs.uterineSistersCount > 0) addHeirToResult("uterineSister", "اخیافی بہن", "Uterine Sister", heirs.uterineSistersCount, "uterineSister", "F");
  if (heirs.unclesCount > 0) addHeirToResult("uncle", "حقیقی چچا", "Paternal Uncle", heirs.unclesCount, "uncle", "M");

  // Determine base multipliers (الاصول) for classical Hanafi base numbers
  // This is a beautiful extra detail: "اصل مسئلہ" identification (6, 12, 24, etc.)
  let calculatedBase = 24;
  let calculationAwlBase = 24;
  if (appliedRule === "awl") {
    // Determine the common base denominator and its extension
    // Simple lookup of base denominators based on fractions present
    const denominators = Object.values(baseShares).map(f => getDenominator(f));
    const findLcm = (arr: number[]): number => {
      const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
      const lcm = (a: number, b: number) => (a * b) / gcd(a, b);
      return arr.reduce((acc, val) => lcm(acc, val), 1);
    };
    calculatedBase = findLcm(denominators.filter(d => d > 1));
    calculationAwlBase = Math.round(calculatedBase * appliedAwlTotal);
  } else if (appliedRule === "radd") {
    calculatedBase = 24; // Standard visual base
  }

  return {
    totalAssets,
    funeralExpenses,
    debts,
    willDeducted,
    willAmount: finalWill,
    netEstate,
    heirs: heirsList,
    baseNumber: calculatedBase > 0 && calculatedBase < 100 ? calculatedBase : undefined,
    baseNumberAfterAwl: appliedRule === "awl" ? calculationAwlBase : undefined,
    appliedRule
  };
}

// Helper to get closest fraction text for standard Islamic inheritance fractions
function getFractionRepresentation(num: number): string {
  if (!num) return "0";
  const tolerance = 0.001;
  const fractions = [
    { text: "1/2", val: 1 / 2 },
    { text: "1/3", val: 1 / 3 },
    { text: "2/3", val: 2 / 3 },
    { text: "1/4", val: 1 / 4 },
    { text: "3/4", val: 3 / 4 },
    { text: "1/6", val: 1 / 6 },
    { text: "1/8", val: 1 / 8 },
    { text: "1/12", val: 1 / 12 },
    { text: "1/24", val: 1 / 24 },
    { text: "1/3", val: 1 / 3 },
    { text: "1/3 باقی", val: 1 / 3 }
  ];

  for (const f of fractions) {
    if (Math.abs(num - f.val) < tolerance) {
      return f.text;
    }
  }

  // Fallback to custom fraction or decimal approximation
  const denominator = Math.round(1 / num);
  if (Math.abs(num - 1 / denominator) < 0.02) {
    return `1/${denominator}`;
  }
  return `${(num * 100).toFixed(1)}%`;
}

function getDenominator(num: number): number {
  if (!num) return 1;
  const tolerance = 0.005;
  for (let i = 1; i <= 24; i++) {
    if (Math.abs(num * i - Math.round(num * i)) < tolerance) {
      return i;
    }
  }
  return Math.round(1 / num);
}
