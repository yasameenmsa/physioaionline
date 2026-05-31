import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from './db';
import User from '../models/User';
import Question from '../models/Question';
import Category from '../models/Category';
import WaitlistEntry from '../models/WaitlistEntry';
import Article from '../models/Article';

const questionsData = {
  "exam_info": {
    "title": "Palestinian Physiotherapy Association Licensing Examination",
    "total_questions": 77,
    "categories": ["Anatomy", "Kinesiology", "Pathology", "Clinical Practice", "Assessment", "Treatment Techniques"]
  },
  "questions": [
    {
      "id": 1,
      "question": "A complete medical history should be conducted how often?",
      "options": [
        "Every visit",
        "Only on the first visit",
        "Every 6 months",
        "Every year"
      ],
      "correct_answer": "Every visit",
      "correct_index": 0,
      "category": "Clinical Practice",
      "explanation": "A complete medical history should be taken at every visit to ensure any changes in the patient's condition are noted and addressed appropriately.",
      "difficulty": "easy"
    },
    {
      "id": 2,
      "question": "Which of the following is NOT a vital sign?",
      "options": [
        "Blood pressure",
        "Heart rate",
        "Pain level",
        "Hair color"
      ],
      "correct_answer": "Hair color",
      "correct_index": 3,
      "category": "Assessment",
      "explanation": "Hair color is not a vital sign. The main vital signs monitored in clinical practice are blood pressure, heart rate, respiratory rate, temperature, and pain level.",
      "difficulty": "easy"
    },
    {
      "id": 3,
      "question": "The brachial plexus is formed by the ventral rami of which spinal nerves?",
      "options": [
        "C5-T1",
        "C1-C4",
        "T1-T12",
        "L1-S1"
      ],
      "correct_answer": "C5-T1",
      "correct_index": 0,
      "category": "Anatomy",
      "explanation": "The brachial plexus is formed by the ventral rami of C5, C6, C7, C8, and T1 spinal nerves. These nerves unite to form the plexus that innervates the upper extremity.",
      "difficulty": "medium"
    },
    {
      "id": 4,
      "question": "Which muscle is the primary abductor of the arm?",
      "options": [
        "Supraspinatus",
        "Deltoid",
        "Teres major",
        "Infraspinatus"
      ],
      "correct_answer": "Deltoid",
      "correct_index": 1,
      "category": "Anatomy",
      "explanation": "The deltoid muscle is the primary abductor of the arm, specifically the middle fibers. The supraspinatus assists with abduction, especially initiating the movement.",
      "difficulty": "easy"
    },
    {
      "id": 5,
      "question": "The rotator cuff muscles include all of the following EXCEPT:",
      "options": [
        "Supraspinatus",
        "Infraspinatus",
        "Teres major",
        "Subscapularis"
      ],
      "correct_answer": "Teres major",
      "correct_index": 2,
      "category": "Anatomy",
      "explanation": "The rotator cuff consists of four muscles: Supraspinatus, Infraspinatus, Teres minor, and Subscapularis (SITS). Teres major is not part of the rotator cuff.",
      "difficulty": "medium"
    },
    {
      "id": 6,
      "question": "Which nerve innervates the deltoid muscle?",
      "options": [
        "Axillary nerve",
        "Musculocutaneous nerve",
        "Radial nerve",
        "Median nerve"
      ],
      "correct_answer": "Axillary nerve",
      "correct_index": 0,
      "category": "Anatomy",
      "explanation": "The axillary nerve (C5, C6) innervates the deltoid muscle and the teres minor muscle.",
      "difficulty": "medium"
    },
    {
      "id": 7,
      "question": "Carpal tunnel syndrome involves compression of which nerve?",
      "options": [
        "Ulnar nerve",
        "Median nerve",
        "Radial nerve",
        "Axillary nerve"
      ],
      "correct_answer": "Median nerve",
      "correct_index": 1,
      "category": "Pathology",
      "explanation": "Carpal tunnel syndrome is caused by compression of the median nerve as it passes through the carpal tunnel in the wrist.",
      "difficulty": "easy"
    },
    {
      "id": 8,
      "question": "The normal range of motion for elbow flexion is approximately:",
      "options": [
        "90 degrees",
        "120 degrees",
        "150 degrees",
        "180 degrees"
      ],
      "correct_answer": "150 degrees",
      "correct_index": 2,
      "category": "Assessment",
      "explanation": "The normal range of motion for elbow flexion is approximately 150 degrees (0-150 degrees). This allows the hand to reach the shoulder and face.",
      "difficulty": "medium"
    },
    {
      "id": 9,
      "question": "Which of the following is a contraindication to applying heat?",
      "options": [
        "Chronic muscle strain",
        "Acute inflammation",
        "Muscle spasm",
        "Joint stiffness"
      ],
      "correct_answer": "Acute inflammation",
      "correct_index": 1,
      "category": "Treatment Techniques",
      "explanation": "Heat is contraindicated in acute inflammatory conditions because it can increase blood flow and potentially exacerbate swelling and inflammation. Cold is typically preferred in acute stages.",
      "difficulty": "medium"
    },
    {
      "id": 10,
      "question": "The Achilles tendon is formed by the junction of which two muscles?",
      "options": [
        "Tibialis anterior and extensor hallucis longus",
        "Gastrocnemius and soleus",
        "Hamstrings and popliteus",
        "Peroneals and tibialis posterior"
      ],
      "correct_answer": "Gastrocnemius and soleus",
      "correct_index": 1,
      "category": "Anatomy",
      "explanation": "The Achilles tendon (calcaneal tendon) is formed by the junction of the gastrocnemius and soleus muscles, which are collectively known as the triceps surae.",
      "difficulty": "medium"
    },
    {
      "id": 11,
      "question": "Which special test is used to assess for anterior cruciate ligament (ACL) injury?",
      "options": [
        "Lachman test",
        "Varus stress test",
        "Valgus stress test",
        "Phalen's test"
      ],
      "correct_answer": "Lachman test",
      "correct_index": 0,
      "category": "Assessment",
      "explanation": "The Lachman test is the most sensitive special test for assessing ACL integrity. The anterior drawer test can also be used but is less sensitive.",
      "difficulty": "medium"
    },
    {
      "id": 12,
      "question": "The primary action of the gluteus medius muscle is:",
      "options": [
        "Hip extension",
        "Hip flexion",
        "Hip abduction",
        "Hip adduction"
      ],
      "correct_answer": "Hip abduction",
      "correct_index": 2,
      "category": "Anatomy",
      "explanation": "The gluteus medius is the primary abductor of the hip. It also plays a crucial role in stabilizing the pelvis during gait (preventing Trendelenburg gait).",
      "difficulty": "easy"
    },
    {
      "id": 13,
      "question": "Which modality is most appropriate for reducing acute edema?",
      "options": [
        "Hot pack",
        "Ultrasound",
        "Cold pack",
        "Shortwave diathermy"
      ],
      "correct_answer": "Cold pack",
      "correct_index": 2,
      "category": "Treatment Techniques",
      "explanation": "Cold therapy (cryotherapy) is most appropriate for acute edema as it causes vasoconstriction, reducing blood flow and fluid accumulation in the affected area.",
      "difficulty": "easy"
    },
    {
      "id": 14,
      "question": "The sciatic nerve exits the pelvis through which opening?",
      "options": [
        "Obturator foramen",
        "Greater sciatic foramen",
        "Lesser sciatic foramen",
        "Inguinal canal"
      ],
      "correct_answer": "Greater sciatic foramen",
      "correct_index": 1,
      "category": "Anatomy",
      "explanation": "The sciatic nerve exits the pelvis through the greater sciatic foramen, below the piriformis muscle, and then travels down the posterior thigh.",
      "difficulty": "medium"
    },
    {
      "id": 15,
      "question": "Which of the following is NOT a phase of wound healing?",
      "options": [
        "Inflammatory phase",
        "Proliferative phase",
        "Contractile phase",
        "Maturation/remodeling phase"
      ],
      "correct_answer": "Contractile phase",
      "correct_index": 2,
      "category": "Pathology",
      "explanation": "The three phases of wound healing are: inflammatory, proliferative, and maturation/remodeling. Contractile phase is not a recognized phase of wound healing.",
      "difficulty": "medium"
    },
    {
      "id": 16,
      "question": "The standard goniometer measurement position for shoulder abduction is:",
      "options": [
        "Prone with arm at side",
        "Supine with arm at side",
        "Standing with arm in frontal plane",
        "Sitting with arm in sagittal plane"
      ],
      "correct_answer": "Standing with arm in frontal plane",
      "correct_index": 2,
      "category": "Assessment",
      "explanation": "Shoulder abduction is typically measured with the patient standing, with the arm moving in the frontal plane. The goniometer axis is placed at the acromion process.",
      "difficulty": "medium"
    },
    {
      "id": 17,
      "question": "Which muscle is the primary knee extensor?",
      "options": [
        "Hamstrings",
        "Gastrocnemius",
        "Quadriceps femoris",
        "Popliteus"
      ],
      "correct_answer": "Quadriceps femoris",
      "correct_index": 2,
      "category": "Anatomy",
      "explanation": "The quadriceps femoris muscle group (rectus femoris, vastus lateralis, vastus medialis, and vastus intermedius) is the primary extensor of the knee joint.",
      "difficulty": "easy"
    },
    {
      "id": 18,
      "question": "A patient presents with foot drop. Which nerve is most likely affected?",
      "options": [
        "Tibial nerve",
        "Common fibular (peroneal) nerve",
        "Sural nerve",
        "Saphenous nerve"
      ],
      "correct_answer": "Common fibular (peroneal) nerve",
      "correct_index": 1,
      "category": "Pathology",
      "explanation": "Foot drop is typically caused by weakness of the dorsiflexors, primarily innervated by the common fibular (peroneal) nerve. This nerve is vulnerable to injury at the fibular head.",
      "difficulty": "medium"
    },
    {
      "id": 19,
      "question": "The pumping effect of muscles during exercise assists with:",
      "options": [
        "Venous return",
        "Arterial flow",
        "Lymphatic drainage",
        "Both A and C"
      ],
      "correct_answer": "Both A and C",
      "correct_index": 3,
      "category": "Physiology",
      "explanation": "Muscle contractions during exercise create a pumping effect that assists both venous return and lymphatic drainage, helping to circulate blood and lymph throughout the body.",
      "difficulty": "medium"
    },
    {
      "id": 20,
      "question": "Which of the following is a classic sign of rotator cuff tear?",
      "options": [
        "Painful arc",
        "Positive Appley test",
        "Positive McMurray test",
        "Ballotable patella"
      ],
      "correct_answer": "Painful arc",
      "correct_index": 0,
      "category": "Assessment",
      "explanation": "A painful arc between 60-120 degrees of abduction is a classic sign of rotator cuff pathology, including tears. The pain typically diminishes beyond 120 degrees.",
      "difficulty": "medium"
    },
    {
      "id": 21,
      "question": "The sacroiliac joint is primarily what type of joint?",
      "options": [
        "Hinge joint",
        "Pivot joint",
        "Synovial plane joint",
        "Ball and socket joint"
      ],
      "correct_answer": "Synovial plane joint",
      "correct_index": 2,
      "category": "Anatomy",
      "explanation": "The sacroiliac joint is a synovial plane (arthrodial) joint with limited movement. It transfers weight from the spine to the lower extremities.",
      "difficulty": "medium"
    },
    {
      "id": 22,
      "question": "Which exercise is most appropriate for a patient with patellofemoral pain syndrome?",
      "options": [
        "Deep squats",
        "Wall sits",
        "Jumping exercises",
        "Vastus medialis obliquus strengthening"
      ],
      "correct_answer": "Vastus medialis obliquus strengthening",
      "correct_index": 3,
      "category": "Treatment Techniques",
      "explanation": "Vastus medialis obliquus (VMO) strengthening is a key component of patellofemoral pain syndrome treatment, as it helps improve patellar tracking.",
      "difficulty": "medium"
    },
    {
      "id": 23,
      "question": "The normal cervical lordosis measures approximately:",
      "options": [
        "10-20 degrees",
        "20-40 degrees",
        "40-60 degrees",
        "60-80 degrees"
      ],
      "correct_answer": "20-40 degrees",
      "correct_index": 1,
      "category": "Assessment",
      "explanation": "The normal cervical lordosis typically measures between 20-40 degrees when measured using the Cobb angle method on lateral radiograph.",
      "difficulty": "hard"
    },
    {
      "id": 24,
      "question": "Which structure passes through the carpal tunnel?",
      "options": [
        "Flexor carpi ulnaris tendon",
        "Median nerve and flexor tendons",
        "Ulnar nerve and artery",
        "Radial nerve"
      ],
      "correct_answer": "Median nerve and flexor tendons",
      "correct_index": 1,
      "category": "Anatomy",
      "explanation": "The carpal tunnel contains the median nerve and the flexor pollicis longus, flexor digitorum superficialis, and flexor digitorum profundus tendons.",
      "difficulty": "medium"
    },
    {
      "id": 25,
      "question": "In the assessment of spinal segmental mobility, which motion occurs at the lumbar spine?",
      "options": [
        "Rotation primarily",
        "Side flexion primarily",
        "Flexion and extension primarily",
        "All motions equally"
      ],
      "correct_answer": "Flexion and extension primarily",
      "correct_index": 2,
      "category": "Assessment",
      "explanation": "The lumbar spine has considerable flexion and extension but limited rotation (approximately 2-3 degrees per segment) due to the orientation of the facet joints.",
      "difficulty": "hard"
    },
    {
      "id": 26,
      "question": "The most common site of lumbar disc herniation is:",
      "options": [
        "L1-L2",
        "L2-L3",
        "L4-L5",
        "L5-S1"
      ],
      "correct_answer": "L4-L5",
      "correct_index": 2,
      "category": "Pathology",
      "explanation": "While L4-L5 and L5-S1 are both common sites, L4-L5 is the most frequent location for lumbar disc herniation due to the mechanical stresses at this level.",
      "difficulty": "medium"
    },
    {
      "id": 27,
      "question": "Which modalities contraindication includes pregnancy?",
      "options": [
        "Cold therapy",
        "Interferential current",
        "Shortwave diathermy",
        "Traction"
      ],
      "correct_answer": "Shortwave diathermy",
      "correct_index": 2,
      "category": "Treatment Techniques",
      "explanation": "Shortwave diathermy is contraindicated during pregnancy due to the heating effects and unknown effects on the developing fetus.",
      "difficulty": "medium"
    },
    {
      "id": 28,
      "question": "The \"circle of Willis\" is located at the base of the:",
      "options": [
        "Heart",
        "Lungs",
        "Brain",
        "Kidneys"
      ],
      "correct_answer": "Brain",
      "correct_index": 2,
      "category": "Anatomy",
      "explanation": "The circle of Willis is a circular anastomosis of arteries at the base of the brain that provides collateral circulation and helps maintain cerebral perfusion.",
      "difficulty": "easy"
    },
    {
      "id": 29,
      "question": "Which muscle is responsible for unlocking the knee joint?",
      "options": [
        "Quadriceps",
        "Hamstrings",
        "Popliteus",
        "Gastrocnemius"
      ],
      "correct_answer": "Popliteus",
      "correct_index": 2,
      "category": "Anatomy",
      "explanation": "The popliteus muscle internally rotates the tibia to \"unlock\" the knee joint from its fully extended (locked) position, allowing flexion to begin.",
      "difficulty": "hard"
    },
    {
      "id": 30,
      "question": "A patient with a stroke affecting the middle cerebral artery would most likely present with:",
      "options": [
        "Visual field deficits",
        "Contralateral motor and sensory deficits, facial weakness",
        "Ataxia and balance problems",
        "Dysphagia and dysarthria"
      ],
      "correct_answer": "Contralateral motor and sensory deficits, facial weakness",
      "correct_index": 1,
      "category": "Pathology",
      "explanation": "The middle cerebral artery supplies the motor and sensory cortex, leading to contralateral hemiparesis, hemisensory loss, and facial weakness (often with upper extremity predominance).",
      "difficulty": "hard"
    },
    {
      "id": 31,
      "question": "Which of the following is NOT a principle of therapeutic exercise?",
      "options": [
        "Overload",
        "Specificity",
        "Reversibility",
        "No pain, no gain"
      ],
      "correct_answer": "No pain, no gain",
      "correct_index": 3,
      "category": "Treatment Techniques",
      "explanation": "\"No pain, no gain\" is not a valid principle of therapeutic exercise. Exercise should be progressed gradually without causing significant pain that might indicate tissue damage.",
      "difficulty": "easy"
    },
    {
      "id": 32,
      "question": "The glenohumeral joint has how many degrees of freedom?",
      "options": [
        "1",
        "2",
        "3",
        "4"
      ],
      "correct_answer": "3",
      "correct_index": 2,
      "category": "Kinesiology",
      "explanation": "The glenohumeral joint is a ball and socket joint with 3 degrees of freedom, allowing movement in all three planes (sagittal, frontal, and transverse).",
      "difficulty": "medium"
    },
    {
      "id": 33,
      "question": "Which of the following is an appropriate treatment for a muscle strain?",
      "options": [
        "Heat initially, then cold",
        "Protection, Rest, Ice, Compression, Elevation (PRICE)",
        "Immediate stretching",
        "Deep massage immediately"
      ],
      "correct_answer": "Protection, Rest, Ice, Compression, Elevation (PRICE)",
      "correct_index": 1,
      "category": "Treatment Techniques",
      "explanation": "PRICE is the standard initial treatment for acute muscle strain. Heat, stretching, and massage are introduced later in the healing process.",
      "difficulty": "easy"
    },
    {
      "id": 34,
      "question": "The supraspinatus tendon is most commonly impinged in which range of shoulder abduction?",
      "options": [
        "0-30 degrees",
        "60-120 degrees",
        "150-180 degrees",
        "Throughout entire range"
      ],
      "correct_answer": "60-120 degrees",
      "correct_index": 1,
      "category": "Pathology",
      "explanation": "The supraspinatus tendon is most commonly impinged between 60-120 degrees of abduction, which is why this is known as the \"painful arc\" in subacromial impingement syndrome.",
      "difficulty": "medium"
    },
    {
      "id": 35,
      "question": "Which structure does NOT pass through the greater sciatic foramen?",
      "options": [
        "Piriformis muscle",
        "Sciatic nerve",
        "Superior gluteal nerve and vessels",
        "Obturator internus tendon"
      ],
      "correct_answer": "Obturator internus tendon",
      "correct_index": 3,
      "category": "Anatomy",
      "explanation": "The obturator internus tendon passes through the lesser sciatic foramen, not the greater sciatic foramen.",
      "difficulty": "hard"
    },
    {
      "id": 36,
      "question": "A patient with weakness in the entire upper extremity likely has a lesion at which spinal nerve level?",
      "options": [
        "C4",
        "C5",
        "C6",
        "C7"
      ],
      "correct_answer": "C5",
      "correct_index": 1,
      "category": "Pathology",
      "explanation": "C5 is the highest segment of the brachial plexus. A lesion at C5 can affect the entire upper extremity to some degree, as it contributes to multiple nerves innervating the arm.",
      "difficulty": "hard"
    },
    {
      "id": 37,
      "question": "Which of the following is the most appropriate initial treatment for acute lateral epicondylitis?",
      "options": [
        "Aggressive stretching",
        "Rest, ice, and gentle range of motion",
        "Heavy resistance exercises",
        "Deep friction massage"
      ],
      "correct_answer": "Rest, ice, and gentle range of motion",
      "correct_index": 1,
      "category": "Treatment Techniques",
      "explanation": "The initial treatment for acute lateral epicondylitis includes rest, ice, and gentle range of motion. Aggressive stretching and strengthening are introduced after the acute phase.",
      "difficulty": "medium"
    },
    {
      "id": 38,
      "question": "The medial collateral ligament (MCL) of the knee resists which force?",
      "options": [
        "Valgus stress",
        "Varus stress",
        "Anterior translation",
        "Posterior translation"
      ],
      "correct_answer": "Valgus stress",
      "correct_index": 0,
      "category": "Anatomy",
      "explanation": "The MCL resists valgus stress (force pushing the knee inward toward the midline). The lateral collateral ligament (LCL) resists varus stress.",
      "difficulty": "medium"
    },
    {
      "id": 39,
      "question": "Which of the following is NOT a component of the Glasgow Coma Scale?",
      "options": [
        "Eye opening response",
        "Verbal response",
        "Motor response",
        "Pupillary response"
      ],
      "correct_answer": "Pupillary response",
      "correct_index": 3,
      "category": "Assessment",
      "explanation": "The Glasgow Coma Scale assesses eye opening, verbal response, and motor response. Pupillary response is not part of the GCS score but is an important neurological assessment.",
      "difficulty": "medium"
    },
    {
      "id": 40,
      "question": "A positive Trendelenburg sign indicates weakness of which muscle?",
      "options": [
        "Gluteus maximus",
        "Gluteus medius",
        "Tensor fasciae latae",
        "Piriformis"
      ],
      "correct_answer": "Gluteus medius",
      "correct_index": 1,
      "category": "Assessment",
      "explanation": "A positive Trendelenburg sign indicates weakness of the gluteus medius on the stance leg, causing the contralateral pelvis to drop when standing on one leg.",
      "difficulty": "medium"
    },
    {
      "id": 41,
      "question": "Which spinal nerve roots contribute to the femoral nerve?",
      "options": [
        "L1-L2",
        "L2-L4",
        "L4-S1",
        "S1-S3"
      ],
      "correct_answer": "L2-L4",
      "correct_index": 1,
      "category": "Anatomy",
      "explanation": "The femoral nerve is formed by the ventral rami of L2, L3, and L4 spinal nerves. It innervates the quadriceps and provides sensation to the anterior thigh.",
      "difficulty": "medium"
    },
    {
      "id": 42,
      "question": "The best position for a patient with respiratory distress is:",
      "options": [
        "Supine",
        "Prone",
        "High Fowler's (sitting upright)",
        "Trendelenburg"
      ],
      "correct_answer": "High Fowler's (sitting upright)",
      "correct_index": 2,
      "category": "Clinical Practice",
      "explanation": "High Fowler's position (sitting upright at 90 degrees) is optimal for patients with respiratory distress as it reduces pressure on the diaphragm and improves lung expansion.",
      "difficulty": "easy"
    },
    {
      "id": 43,
      "question": "Which of the following is a grade 3 (poor) muscle strength according to the Medical Research Council scale?",
      "options": [
        "No movement",
        "Movement with gravity eliminated",
        "Movement against gravity but not resistance",
        "Movement against moderate resistance"
      ],
      "correct_answer": "Movement against gravity but not resistance",
      "correct_index": 2,
      "category": "Assessment",
      "explanation": "According to the MRC scale, grade 3 (fair/poor) muscle strength is when the muscle can move the body part through full range against gravity but cannot overcome any additional resistance.",
      "difficulty": "medium"
    },
    {
      "id": 44,
      "question": "The normal range for active elbow extension is:",
      "options": [
        "0 degrees (fully extended)",
        "5 degrees of hyperextension",
        "10 degrees of hyperextension",
        "15 degrees of flexion contracture"
      ],
      "correct_answer": "0 degrees (fully extended)",
      "correct_index": 0,
      "category": "Assessment",
      "explanation": "The normal range for elbow extension is 0 degrees, meaning the arm can be fully straightened. Some individuals may have a few degrees of hyperextension, but 0 degrees is considered normal.",
      "difficulty": "easy"
    },
    {
      "id": 45,
      "question": "Which of the following is the most common complication of immobilization?",
      "options": [
        "Muscle hypertrophy",
        "Joint contracture",
        "Increased bone density",
        "Improved circulation"
      ],
      "correct_answer": "Joint contracture",
      "correct_index": 1,
      "category": "Pathology",
      "explanation": "Joint contracture is a common complication of immobilization, as tissues shorten and adapt to the immobile position. Muscle atrophy, decreased bone density, and poor circulation are also complications.",
      "difficulty": "easy"
    },
    {
      "id": 46,
      "question": "The patellar reflex tests which spinal nerve segments?",
      "options": [
        "L1-L2",
        "L2-L4",
        "L4-S1",
        "S1-S2"
      ],
      "correct_answer": "L2-L4",
      "correct_index": 1,
      "category": "Assessment",
      "explanation": "The patellar (knee jerk) reflex tests the L2, L3, and L4 spinal segments, primarily L4. This reflex is mediated by the femoral nerve.",
      "difficulty": "medium"
    },
    {
      "id": 47,
      "question": "Which of the following exercises is OPEN kinetic chain?",
      "options": [
        "Squat",
        "Lunge",
        "Leg press",
        "Knee extension (seated)"
      ],
      "correct_answer": "Knee extension (seated)",
      "correct_index": 3,
      "category": "Treatment Techniques",
      "explanation": "In an open kinetic chain exercise, the distal segment is free to move (e.g., seated knee extension). In closed chain exercises (squat, lunge, leg press), the distal segment is fixed.",
      "difficulty": "medium"
    },
    {
      "id": 48,
      "question": "The most common mechanism of injury for anterior cruciate ligament (ACL) tears is:",
      "options": [
        "Direct blow to lateral knee",
        "Non-contact pivoting with planted foot",
        "Hyperextension of knee",
        "Excessive valgus force"
      ],
      "correct_answer": "Non-contact pivoting with planted foot",
      "correct_index": 1,
      "category": "Pathology",
      "explanation": "The most common mechanism of ACL injury is non-contact, involving deceleration, pivoting, or cutting with a planted foot. This places rotational stress on the ligament.",
      "difficulty": "medium"
    },
    {
      "id": 49,
      "question": "The posterior cruciate ligament (PCL) prevents which motion?",
      "options": [
        "Anterior translation of tibia",
        "Posterior translation of tibia",
        "Valgus stress",
        "Varus stress"
      ],
      "correct_answer": "Posterior translation of tibia",
      "correct_index": 1,
      "category": "Anatomy",
      "explanation": "The PCL prevents posterior translation of the tibia relative to the femur. It is the primary restraint to posterior drawer of the knee.",
      "difficulty": "medium"
    },
    {
      "id": 50,
      "question": "Which of the following is a red flag for low back pain?",
      "options": [
        "Pain worse with flexion",
        "Unexplained weight loss",
        "Morning stiffness",
        "Pain relieved by rest"
      ],
      "correct_answer": "Unexplained weight loss",
      "correct_index": 1,
      "category": "Assessment",
      "explanation": "Unexplained weight loss is a red flag that may indicate serious pathology such as cancer or infection. Other red flags include fever, night pain, and bowel/bladder dysfunction.",
      "difficulty": "easy"
    }
  ]
};

async function seedDatabase() {
  try {
    await connectDB();

    console.log('Connected to MongoDB. Starting seed...');

    // Clear existing data
    await User.deleteMany({});
    await Question.deleteMany({});
    await Category.deleteMany({});
    await WaitlistEntry.deleteMany({});
    console.log('Cleared existing data');

    // Create categories
    const categoryMap = new Map<string, string>();
    const categories = [
      { name: 'Anatomy', slug: 'anatomy', description: 'Questions related to human anatomy', questionCount: 0, active: true },
      { name: 'Kinesiology', slug: 'kinesiology', description: 'Questions related to human movement and biomechanics', questionCount: 0, active: true },
      { name: 'Pathology', slug: 'pathology', description: 'Questions related to diseases and conditions', questionCount: 0, active: true },
      { name: 'Clinical Practice', slug: 'clinical-practice', description: 'Questions related to clinical practice and procedures', questionCount: 0, active: true },
      { name: 'Assessment', slug: 'assessment', description: 'Questions related to physical assessment and evaluation', questionCount: 0, active: true },
      { name: 'Treatment Techniques', slug: 'treatment-techniques', description: 'Questions related to therapeutic interventions and techniques', questionCount: 0, active: true },
      { name: 'Physiology', slug: 'physiology', description: 'Questions related to body functions and processes', questionCount: 0, active: true },
    ];

    for (const category of categories) {
      const created = await Category.create(category);
      categoryMap.set(category.name, created._id.toString());
      console.log(`Created category: ${category.name}`);
    }

    // Create questions
    const categoryCounts: Record<string, number> = {};

    for (const q of questionsData.questions) {
      // Map category name to category ID
      const categoryId = categoryMap.get(q.category) || categoryMap.get('Anatomy')!;

      await Question.create({
        questionText: q.question,
        category: categoryId,
        options: q.options,
        correctAnswer: q.correct_index,
        explanation: q.explanation,
        difficulty: (q.difficulty || 'medium') as 'easy' | 'medium' | 'hard',
        source: 'Palestinian Physiotherapy Association Licensing Examination',
        active: true,
      });

      categoryCounts[q.category] = (categoryCounts[q.category] || 0) + 1;
    }

    console.log(`Created ${questionsData.questions.length} questions`);
    console.log('Question distribution:', categoryCounts);

    // Update category question counts
    for (const [name, count] of Object.entries(categoryCounts)) {
      const categoryId = categoryMap.get(name);
      if (categoryId) {
        await Category.findByIdAndUpdate(categoryId, { questionCount: count });
      }
    }

    // Create articles
    const articlesData = [
      {
        title: 'Understanding the Gait Cycle: A Comprehensive Guide',
        slug: 'understanding-gait-cycle',
        category: 'Kinesiology',
        excerpt: 'A detailed exploration of the gait cycle phases, muscle activations, and clinical implications for physiotherapy practice.',
        body: `# Understanding the Gait Cycle

## Introduction

The gait cycle is the foundation of human locomotion. Understanding its phases, muscle activations, and biomechanical requirements is essential for any physiotherapist working with patients who have gait impairments.

## Phases of the Gait Cycle

The gait cycle is divided into two main phases: **stance phase** (60%) and **swing phase** (40%).

### Stance Phase

The stance phase begins when the foot contacts the ground and ends when the same foot leaves the ground. It consists of:

1. **Initial Contact (Heel Strike)** — 0% of cycle
   - The heel contacts the ground
   - Hip is flexed at ~30°, knee is extended, ankle is in neutral
   - Eccentric control of tibialis anterior prevents foot slap

2. **Loading Response** — 0-10%
   - Weight is transferred onto the stance leg
   - Knee flexes to ~15° to absorb shock
   - Ankle plantarflexes to foot-flat position

3. **Mid Stance** — 10-30%
   - Body weight is directly over the stance foot
   - Single leg support phase
   - Hip extends to neutral, knee extends, ankle dorsiflexes

4. **Terminal Stance** — 30-50%
   - Heel begins to rise
   - Hip hyperextends, knee remains extended
   - Ankle plantarflexes for push-off

5. **Pre-Swing** — 50-60%
   - Final push-off
   - Toe-off marks the transition to swing phase

### Swing Phase

1. **Initial Swing** — 60-73%
   - Foot leaves the ground
   - Hip flexes, knee flexes to ~60°, ankle dorsiflexes

2. **Mid Swing** — 73-87%
   - Foot passes directly beneath the body
   - Knee extends as the foot advances

3. **Terminal Swing** — 87-100%
   - Knee fully extends in preparation for heel strike
   - Ankle maintains dorsiflexion

## Common Gait Abnormalities

| Abnormality | Description | Associated Condition |
|-------------|-------------|---------------------|
| Trendelenburg Gait | Pelvis drops on swing side | Gluteus medius weakness |
| High Steppage Gait | Excessive hip/knee flexion | Foot drop (peroneal nerve injury) |
| Antalgic Gait | Shortened stance phase | Painful limb |
| Circumduction Gait | Leg swings outward | Hemiplegia, stiff knee |

## Clinical Assessment

A comprehensive gait assessment should include:

- **Observation**: View from anterior, posterior, and lateral
- **Timing**: Measure cadence, stride length, velocity
- **Joint Angles**: Use goniometry or motion capture
- **Muscle Activity**: Palpation or EMG
- **Energy Expenditure**: VO2 measurement or physiological cost index

## Key Muscles by Phase

- **Heel Strike**: Tibialis anterior (eccentric), Quadriceps
- **Loading Response**: Quadriceps (eccentric), Gluteus maximus
- **Mid Stance**: Gluteus medius, Quadriceps, Plantarflexors
- **Push-Off**: Gastrocnemius, Soleus, Hip flexors
- **Swing**: Iliopsoas, Hamstrings, Tibialis anterior

## Conclusion

Gait analysis is a cornerstone of physiotherapy assessment. By understanding the normal biomechanics of walking, clinicians can identify impairments and develop targeted interventions to improve mobility and quality of life.`,
        tags: ['gait', 'biomechanics', 'locomotion', 'assessment'],
        references: ['https://pubmed.ncbi.nlm.nih.gov/', 'https://www.physio-pedia.com/Gait'],
        status: 'published',
      },
      {
        title: 'Manual Therapy Techniques for Lumbar Spine Dysfunction',
        slug: 'manual-therapy-lumbar-spine',
        category: 'Treatment Techniques',
        excerpt: 'Evidence-based manual therapy approaches for assessment and treatment of common lumbar spine conditions.',
        body: `# Manual Therapy Techniques for Lumbar Spine Dysfunction

## Introduction

Manual therapy is a core skill in physiotherapy practice. When applied to the lumbar spine, these techniques can reduce pain, improve mobility, and restore function.

## Evidence Base

Current evidence supports manual therapy for:
- Acute and sub-acute low back pain
- Chronic low back pain (as part of a multimodal approach)
- Lumbar radiculopathy
- Post-surgical stiffness

## Assessment Prior to Manual Therapy

Before applying any technique, a thorough assessment is essential:

1. **Subjective History**: Pain location, nature, aggravating/relieving factors, red flags
2. **Observation**: Posture, muscle spasm, asymmetry
3. **Active Movements**: Range, quality, pain response
4. **Passive Physiological Movements**: Joint play, end-feel
5. **Palpation**: Tenderness, temperature, tissue texture

## Common Techniques

### 1. Central Posterior-Anterior (PA) Mobilizations

Application of oscillatory pressure on the spinous process.

- **Grade I**: Small amplitude, beginning of range (for pain)
- **Grade II**: Large amplitude, mid-range (for pain + stiffness)
- **Grade III**: Large amplitude, end-range (for stiffness)
- **Grade IV**: Small amplitude, end-range (for stiffness)

### 2. Unilateral PA Mobilizations

Applied to the articular pillar, more specific than central PAs.

### 3. Rotation Mobilizations

Side-lying position with rotation through the lumbar spine.

### 4. Muscle Energy Techniques (MET)

Patient contracts specific muscles against therapist resistance to normalize joint mechanics.

### 5. Soft Tissue Mobilization

Addresses paraspinal muscle hypertonicity and fascial restrictions.

## Contraindications

- Acute fracture
- Infection
- Malignancy
- Cauda equina syndrome
- Inflammatory arthropathy (acute flare)
- Severe osteoporosis

## Red Flags Requiring Referral

- Unexplained weight loss
- Fever, chills
- Night pain
- Bowel/bladder dysfunction
- Saddle anesthesia
- Progressive neurological deficit

## Conclusion

Manual therapy is an effective tool for managing lumbar spine dysfunction when applied within a thorough clinical reasoning framework. Always combine with active exercise for optimal outcomes.`,
        tags: ['manual therapy', 'lumbar spine', 'low back pain', 'mobilization'],
        references: ['https://pubmed.ncbi.nlm.nih.gov/'],
        status: 'published',
      },
      {
        title: 'Therapeutic Exercise Prescription: Principles and Practice',
        slug: 'therapeutic-exercise-prescription',
        category: 'Treatment Techniques',
        excerpt: 'Evidence-based guidelines for prescribing therapeutic exercise across different patient populations and conditions.',
        body: `# Therapeutic Exercise Prescription

## Fundamental Principles

### 1. Specificity (SAID Principle)

The Specific Adaptation to Imposed Demands principle states that the body adapts specifically to the type of training performed.

### 2. Overload

To improve, tissues must be loaded beyond their current capacity. This can be achieved by modifying:
- **Frequency**: How often exercise is performed
- **Intensity**: How hard the exercise is
- **Time**: Duration of exercise session
- **Type**: Mode of exercise

### 3. Progression

Loading must be systematically increased as the patient adapts.

### 4. Reversibility

"Use it or lose it" — detraining occurs rapidly when exercise ceases.

### 5. Individualization

Every patient requires a tailored program based on their specific impairments, goals, and preferences.

## The Exercise Prescription Framework

### Phase 1: Pain and Protection

Goals: Pain relief, tissue protection, basic range of motion
- Low intensity
- Pain-free range only
- Emphasis on neuromuscular control

### Phase 2: Controlled Loading

Goals: Increase tissue capacity, improve motor control
- Gradual increase in load
- Introduce eccentric loading
- Begin functional patterns

### Phase 3: Return to Function

Goals: Full tissue capacity, sport/activity-specific training
- High intensity
- Sport-specific movements
- Progressive return to activity

## Dosage Parameters

| Goal | Sets | Reps | Rest | Frequency |
|------|------|------|------|-----------|
| Strength | 3-5 | 6-12 | 2-3 min | 2-4x/week |
| Hypertrophy | 3-4 | 8-15 | 60-90s | 3-5x/week |
| Endurance | 2-3 | 15-25 | 30-60s | 3-6x/week |
| Power | 3-5 | 3-6 | 3-5 min | 2-3x/week |

## Special Populations

### Older Adults
- Focus on functional exercises
- Include balance training
- Address sarcopenia with progressive resistance

### Post-Surgical
- Follow tissue healing timelines
- Protect surgical site
- Gradual progression through phases

### Chronic Conditions
- Consider energy limitations
- Include aerobic component
- Pain monitoring essential

## Conclusion

Therapeutic exercise prescription is both an art and a science. By applying exercise physiology principles and tailoring programs to individual patients, physiotherapists can optimize outcomes across a wide range of conditions.`,
        tags: ['exercise prescription', 'rehabilitation', 'strength training', 'dosage'],
        references: ['https://pubmed.ncbi.nlm.nih.gov/'],
        status: 'published',
      },
      {
        title: 'Understanding Pain: Neurophysiology for Clinicians',
        slug: 'pain-neurophysiology-clinicians',
        category: 'Pathology',
        excerpt: 'A clinician-friendly guide to pain neurophysiology, including nociception, central sensitization, and pain modulation.',
        body: `# Understanding Pain: Neurophysiology for Clinicians

## What is Pain?

The International Association for the Study of Pain (IASP) defines pain as "an unpleasant sensory and emotional experience associated with actual or potential tissue damage."

## Types of Pain

### Nociceptive Pain

Caused by activation of nociceptors in response to tissue damage.

- **Somatic**: Well-localized, sharp/aching (e.g., muscle strain)
- **Visceral**: Poorly localized, cramping (e.g., organ pathology)

### Neuropathic Pain

Caused by damage or disease affecting the somatosensory nervous system.

- Features: Burning, shooting, electric shock-like
- Examples: Diabetic neuropathy, radiculopathy, CRPS

### Nociplastic Pain

Pain arising from altered nociception despite no clear evidence of tissue damage or nerve pathology.

- Central sensitization
- Fibromyalgia
- Non-specific chronic pain

## Pain Neurophysiology

### The Nociceptive Pathway

1. **Transduction**: Noxious stimuli are converted to electrical signals at nociceptors
2. **Transmission**: Signals travel via A-delta (fast, myelinated) and C-fibers (slow, unmyelinated)
3. **Modulation**: Signals can be amplified or inhibited in the spinal cord
4. **Perception**: Cortical processing creates the pain experience

### Central Sensitization

Increased responsiveness of nociceptive neurons in the central nervous system to normal or subthreshold input.

**Features:**
- Allodynia (pain from normally non-painful stimuli)
- Hyperalgesia (increased pain from normally painful stimuli)
- Expanded receptive fields
- Temporal summation (wind-up)

### Pain Modulation

The body has endogenous pain modulation systems:

- **Descending Inhibition**: Signals from the brainstem (PAG, RVM) can inhibit nociceptive transmission
- **Gate Control Theory**: Large fiber (touch) input can "close the gate" to pain signals
- **Conditioned Pain Modulation**: One painful stimulus can inhibit another

## Clinical Implications

### When to PUSH vs. PACE

| Acute Pain | Chronic Pain |
|------------|--------------|
| Rest and protect | Gradual activation |
| Passive modalities may help | Active strategies essential |
| Pain is a tissue danger signal | Pain is often amplified, not dangerous |
| Short-term medication useful | Minimize medication use |

### Pain Neuroscience Education (PNE)

Teaching patients about their pain can:
- Reduce threat perception
- Decrease fear avoidance
- Improve outcomes
- Enhance self-efficacy

## Conclusion

Understanding pain neurophysiology transforms clinical practice. It allows clinicians to move beyond tissue-based models and address the biopsychosocial factors that drive the pain experience.`,
        tags: ['pain science', 'neuroscience', 'central sensitization', 'education'],
        references: ['https://www.iasp-pain.org/'],
        status: 'published',
      },
      {
        title: 'Shoulder Impingement Syndrome: Assessment and Conservative Management',
        slug: 'shoulder-impingement-syndrome',
        category: 'Pathology',
        excerpt: 'Comprehensive review of shoulder impingement syndrome including subtypes, clinical assessment, and evidence-based rehabilitation.',
        body: `# Shoulder Impingement Syndrome

## Introduction

Shoulder impingement syndrome is one of the most common causes of shoulder pain, accounting for up to 65% of all shoulder complaints in clinical practice.

## Types of Impingement

### External (Subacromial) Impingement

Compression of the supraspinatus tendon, subacromial bursa, or biceps tendon beneath the acromion.

- **Primary**: Mechanical narrowing of subacromial space
- **Secondary**: Functional narrowing due to instability or motor control deficits

### Internal Impingement

Contact between the undersurface of the rotator cuff and the posterosuperior glenoid labrum, common in overhead athletes.

## Risk Factors

- Repetitive overhead activity
- Scapular dyskinesis
- Rotator cuff weakness
- Posterior capsule tightness
- Poor posture (forward head, rounded shoulders)

## Clinical Assessment

### Subjective
- Anterolateral shoulder pain
- Painful arc (60-120° abduction)
- Night pain
- Pain with overhead activities

### Special Tests

| Test | Sensitivity | Specificity |
|------|-------------|-------------|
| Neer's Sign | 78% | 58% |
| Hawkins-Kennedy | 79% | 59% |
| Painful Arc | 73% | 81% |
| Empty Can (Jobe's) | 68% | 73% |

### Objective Assessment

- Range of motion (active and passive)
- Strength testing
- Scapular assessment
- Posterior capsule tightness
- Cervical spine screening

## Conservative Management

### Phase 1: Pain Relief (Week 1-2)
- Activity modification
- Ice and anti-inflammatory modalities
- Pain-free range of motion
- Submaximal isometrics

### Phase 2: Motor Control (Week 2-4)
- Scapular stabilization exercises
- Rotator cuff strengthening (eccentric)
- Posterior capsule stretching
- Neuromuscular re-education

### Phase 3: Functional Loading (Week 4-8)
- Progressive resistance training
- Sport-specific movements
- Plyometric progression
- Return to activity planning

## Key Exercises

1. **Scapular Retraction**: Prone rowing, wall slides
2. **External Rotation**: Side-lying or cable
3. **Lower Trapezius Activation**: Prone Y raises
4. **Posterior Capsule Stretch**: Cross-body stretch
5. **Eccentric Loading**: Lateral pull-downs

## When to Refer

- Failure to improve after 12 weeks of conservative care
- Suspected full-thickness rotator cuff tear
- Glenohumeral internal rotation deficit (GIRD) > 20°
- Atraumatic instability

## Conclusion

Shoulder impingement responds well to conservative physiotherapy when treatment addresses all contributing factors including scapular control, rotator cuff strength, and mobility. A structured, phased approach optimizes outcomes.`,
        tags: ['shoulder', 'impingement', 'rotator cuff', 'rehabilitation'],
        references: ['https://pubmed.ncbi.nlm.nih.gov/'],
        status: 'published',
      },
      {
        title: 'ACL Rehabilitation: From Injury to Return to Sport',
        slug: 'acl-rehabilitation',
        category: 'Treatment Techniques',
        excerpt: 'Evidence-based ACL rehabilitation protocol covering prehabilitation, post-surgical phases, and return-to-sport criteria.',
        body: `# ACL Rehabilitation

## Introduction

Anterior cruciate ligament (ACL) injury is one of the most common and debilitating knee injuries in athletes. Rehabilitation typically spans 9-12 months and requires a systematic, criterion-based approach.

## Prehabilitation (Pre-Op)

Goals:
- Reduce effusion
- Restore full range of motion
- Normalize gait
- Activate quadriceps
- Address psychological readiness

Key metrics before surgery:
- Full knee extension equal to uninvolved side
- Quadriceps strength > 80% of uninvolved side
- Minimal effusion
- Normal gait pattern

## Post-Operative Rehabilitation Phases

### Phase 1: Protection (Week 0-2)

**Goals**: Protect graft, control pain and swelling, activate quadriceps

- Weight-bearing as tolerated in brace locked in extension
- Quadriceps sets, ankle pumps
- Patellar mobilization
- Ice and compression
- Sleep in brace locked in extension

**Cautions**: No open chain knee extension 0-45°, no active hamstring for patellar graft

### Phase 2: Mobility (Week 2-6)

**Goals**: Full extension, 120° flexion, normal gait

- Brace unlocked for walking
- Stationary bike (when flexion > 105°)
- Prone hangs for extension
- Neuromuscular electrical stimulation (NMES)

### Phase 3: Strength (Week 6-12)

**Goals**: Improve strength, proprioception, and neuromuscular control

- Closed chain exercises (squat, leg press 0-60°)
- Balance and proprioception
- Begin open chain knee extension 90-40°
- Aquatic therapy

### Phase 4: Loading (Month 3-6)

**Goals**: Increase strength and loading capacity

- Progressive resistance training
- Running program (when criteria met)
- Plyometric initiation
- Agility drills

### Phase 5: Return to Sport (Month 6-9+)

**Goals**: Prepare for sport-specific demands

## Return to Sport Criteria

1. **Time**: Minimum 9 months post-op
2. **Strength**: LSI (Limb Symmetry Index) > 90% for quadriceps and hamstrings
3. **Hop Tests**: Single hop, triple hop, crossover hop, 6m timed hop — all LSI > 90%
4. **Movement Quality**: Pass landing assessment (LESS, tuck jump)
5. **Psychological Readiness**: ACL-RSI score > 70
6. **Sport-Specific Testing**: Completed sport-specific training without issues

## Graft-Specific Considerations

| Graft Type | Special Consideration |
|------------|----------------------|
| Patellar Tendon | Anterior knee pain, extension deficit |
| Hamstring | Hamstring weakness, increased laxity |
| Quadriceps | Patellofemoral issues, extension deficit |
| Allograft | Slower incorporation, higher re-rupture risk |

## Conclusion

ACL rehabilitation requires a criterion-based, not time-based, approach. Rushing return to sport significantly increases re-injury risk. The emphasis should be on quality of movement, strength symmetry, and psychological readiness.`,
        tags: ['ACL', 'knee', 'rehabilitation', 'sports medicine'],
        references: ['https://pubmed.ncbi.nlm.nih.gov/'],
        status: 'published',
      },
      {
        title: 'Postural Assessment and Correction in Clinical Practice',
        slug: 'postural-assessment-correction',
        category: 'Assessment',
        excerpt: 'Guidelines for systematic postural assessment and evidence-based interventions for common postural dysfunctions.',
        body: `# Postural Assessment and Correction

## The Role of Posture in Physiotherapy

Posture is the alignment of body segments in relation to each other and the environment. While posture alone is rarely the sole cause of pain, it contributes to load distribution, muscle activity patterns, and can be a factor in many musculoskeletal conditions.

## Systematic Postural Assessment

### Anterior View

- **Head**: Tilt, rotation
- **Shoulders**: Level, elevation/depression
- **Clavicles**: Symmetry
- **Arms**: Carrying angle, rotation
- **Hands**: Pronation/supination
- **Pelvis**: Level, rotation
- **Knees**: Valgus/varus
- **Feet**: Arch height, toe-out angle

### Lateral View

- **Ear**: Should be aligned with acromion
- **Shoulder**: Protraction/retraction
- **Thoracic Spine**: Kyphosis
- **Pelvis**: Anterior/posterior tilt
- **Hip**: Flexion/extension
- **Knee**: Hyperextension/flexion
- **Ankle**: Dorsiflexion/plantarflexion

### Posterior View

- **Head**: Tilt, rotation
- **Shoulders**: Level, scapular position
- **Scapulae**: Winging, elevation, rotation
- **Spine**: Lateral curvatures (scoliosis)
- **Pelvis**: Level, rotation
- **Knees**: Popliteal crease symmetry
- **Feet**: Calcaneal position (varus/valgus)

## Common Postural Dysfunctions

### Forward Head Posture

**Characteristics**: Head positioned anterior to the center of gravity line

**Associated Issues**:
- Increased cervical lordosis
- Upper cervical extension
- Lower cervical flexion
- Suboccipital muscle tension

**Interventions**:
- Chin tucks
- Upper thoracic mobilization
- Deep neck flexor strengthening

### Upper Crossed Syndrome

**Characteristics**: Tight upper trapezius/levator scapulae and pectorals, weak deep neck flexors and lower/middle trapezius

**Interventions**:
- Stretch: Upper trapezius, pectorals, levator scapulae
- Strengthen: Lower trapezius, serratus anterior, deep neck flexors

### Lower Crossed Syndrome

**Characteristics**: Tight hip flexors and lumbar extensors, weak abdominals and gluteals

**Interventions**:
- Stretch: Hip flexors (rectus femoris, iliopsoas), lumbar extensors
- Strengthen: Transversus abdominis, multifidus, gluteals

### Swayback Posture

**Characteristics**: Anterior pelvic shift, hip extension, thoracic kyphosis, forward head

**Interventions**:
- Core stabilization
- Hip flexor flexibility
- Proprioceptive re-education

## Evidence and Caveats

- Posture alone is NOT a reliable predictor of pain
- Correction should be task-specific, not just static alignment
- Focus on movement variability rather than "perfect" posture
- Consider psychosocial factors and ergonomics

## Conclusion

Postural assessment remains a valuable clinical tool when used within a broader biopsychosocial framework. Interventions should focus on improving movement capacity and reducing tissue stress rather than achieving "ideal" alignment.`,
        tags: ['posture', 'assessment', 'ergonomics', 'correction'],
        references: ['https://pubmed.ncbi.nlm.nih.gov/'],
        status: 'published',
      },
      {
        title: 'Clinical Outcome Measures in Physiotherapy',
        slug: 'clinical-outcome-measures',
        category: 'Assessment',
        excerpt: 'A practical guide to selecting, administering, and interpreting standardized outcome measures in physiotherapy practice.',
        body: `# Clinical Outcome Measures in Physiotherapy

## Why Use Outcome Measures?

Outcome measures provide objective data to:
- Quantify patient status at initial assessment
- Track progress over time
- Demonstrate treatment effectiveness
- Guide clinical decision-making
- Meet regulatory and payer requirements

## Selecting Outcome Measures

### Criteria for Selection

1. **Reliability**: Consistent results across raters and time
2. **Validity**: Measures what it claims to measure
3. **Responsiveness**: Detects clinically important change
4. **Minimal Clinically Important Difference (MCID)**: The smallest change that is meaningful to the patient
5. **Floor/Ceiling Effects**: Avoid measures where patients cluster at extremes
6. **Practicality**: Time, equipment, and training required

## Region-Specific Measures

### Lumbar Spine

| Measure | Items | MCID | Time |
|---------|-------|------|------|
| Oswestry Disability Index (ODI) | 10 | 10-15 points | 5 min |
| Roland-Morris Questionnaire | 24 | 5 points | 5 min |
| Quebec Back Pain Disability Scale | 20 | 15 points | 5 min |

### Cervical Spine

| Measure | Items | MCID | Time |
|---------|-------|------|------|
| Neck Disability Index (NDI) | 10 | 7-10 points | 5 min |
| Northwick Park Neck Pain Questionnaire | 9 | 20% | 5 min |

### Shoulder

| Measure | Items | MCID | Time |
|---------|-------|------|------|
| Disabilities of Arm, Shoulder, Hand (DASH) | 30 | 10-15 points | 10 min |
| Shoulder Pain and Disability Index (SPADI) | 13 | 10-13 points | 5 min |
| Simple Shoulder Test (SST) | 12 | 2 points | 3 min |

### Knee

| Measure | Items | MCID | Time |
|---------|-------|------|------|
| Knee Injury and Osteoarthritis Score (KOOS) | 42 | 8-10 points | 15 min |
| International Knee Documentation Committee (IKDC) | 18 | 11-20 points | 10 min |
| Lysholm Knee Score | 8 | 10 points | 5 min |

### Hip

| Measure | Items | MCID | Time |
|---------|-------|------|------|
| Hip disability and Osteoarthritis Outcome Score (HOOS) | 40 | 8-10 points | 15 min |
| Harris Hip Score | 10 | 10 points | 10 min |

### Generic/Global Measures

- **Patient-Specific Functional Scale (PSFS)**: Patient identifies 3-5 activities
- **Global Rating of Change (GROC)**: 15-point scale (-7 to +7)
- **Numeric Pain Rating Scale (NPRS)**: 0-10, MCID = 2 points
- **EQ-5D-5L**: Quality of life measure

## Performance-Based Measures

- **Timed Up and Go (TUG)**: Mobility and fall risk
- **5-Times Sit to Stand (5STS)**: Lower extremity strength
- **6-Minute Walk Test (6MWT)**: Functional exercise capacity
- **30-Second Chair Stand**: Lower extremity endurance
- **Single Leg Stance**: Balance assessment

## Documentation and Interpretation

- Record baseline scores and date
- Re-assess at regular intervals (e.g., every 4 weeks)
- Compare change to MCID values
- Use for goal setting and discharge planning
- Include in clinical notes and reports

## Conclusion

Outcome measures are essential tools in evidence-based physiotherapy practice. The key is selecting measures that are reliable, valid, and practical for your specific clinical setting and patient population.`,
        tags: ['outcome measures', 'assessment', 'measurement', 'evidence-based practice'],
        references: ['https://pubmed.ncbi.nlm.nih.gov/'],
        status: 'published',
      },
      {
        title: 'Cardiovascular Rehabilitation: Principles and Programming',
        slug: 'cardiovascular-rehabilitation',
        category: 'Clinical Practice',
        excerpt: 'Evidence-based guidelines for designing and implementing cardiovascular rehabilitation programs for patients with cardiac conditions.',
        body: `# Cardiovascular Rehabilitation

## Introduction

Cardiovascular rehabilitation is a comprehensive program designed to improve cardiovascular health in patients with heart disease or those at risk for developing it. It is a Class I recommendation for multiple cardiac conditions.

## Core Components

1. **Patient Assessment**: Medical history, risk stratification, functional capacity
2. **Exercise Training**: Aerobic, resistance, and flexibility
3. **Risk Factor Management**: Blood pressure, lipids, glucose, weight
4. **Psychosocial Support**: Stress management, depression screening
5. **Patient Education**: Disease management, lifestyle modification

## Exercise Prescription

### The FITT-VP Principle

| Component | Recommendation |
|-----------|---------------|
| Frequency | 3-5 days/week |
| Intensity | 40-80% HRR or RPE 11-16 |
| Time | 20-60 minutes/session |
| Type | Aerobic + Resistance |
| Volume | 500-1000 MET-min/week |
| Progression | Gradual, 10% increase/week |

### Intensity Monitoring

- **Heart Rate Reserve (Karvonen Formula)**:
  Target HR = [(HRmax - HRrest) × %Intensity] + HRrest

- **Rating of Perceived Exertion (RPE)**:
  - Borg 6-20 scale: Target 11-16
  - Borg CR-10: Target 3-5

- **Talk Test**: Patient should be able to speak in short sentences

## Risk Stratification

### Low Risk
- No complex ventricular arrhythmias
- Normal hemodynamic response to exercise
- Functional capacity > 7 METs

### Moderate Risk
- Reduced exercise tolerance (< 7 METs)
- Mild ischemia on exercise testing
- Mild left ventricular dysfunction

### High Risk
- Severe left ventricular dysfunction (EF < 30%)
- Complex arrhythmias at low workload
- Exercise-induced hypotension
- Recent cardiac event (< 2 weeks)

## Phases of Cardiac Rehabilitation

### Phase I: Inpatient
- Early mobilization
- Education on risk factors
- Discharge planning

### Phase II: Early Outpatient (4-12 weeks)
- Supervised exercise 2-3x/week
- Monitoring and progression
- Comprehensive education

### Phase III: Long-Term Maintenance
- Unsupervised or minimally supervised
- Lifetime adherence focus
- Periodic reassessment

## Contraindications to Exercise Training

- Unstable angina
- Uncontrolled hypertension (SBP > 180/100)
- Significant aortic stenosis
- Acute systemic illness
- Uncontrolled arrhythmias
- Severe obstructive cardiomyopathy

## Conclusion

Cardiovascular rehabilitation is a cornerstone of cardiac care. A well-designed program addressing all core components significantly reduces morbidity and mortality while improving quality of life.`,
        tags: ['cardiac rehab', 'exercise prescription', 'heart disease', 'risk factors'],
        references: ['https://pubmed.ncbi.nlm.nih.gov/'],
        status: 'published',
      },
      {
        title: 'Understanding Motor Control and Motor Learning',
        slug: 'motor-control-learning',
        category: 'Kinesiology',
        excerpt: 'Key concepts in motor control and motor learning theory and their practical applications in physiotherapy rehabilitation.',
        body: `# Motor Control and Motor Learning

## Introduction

Motor control and motor learning are fundamental concepts in physiotherapy. Understanding how the nervous system controls movement and how new motor skills are acquired directly informs rehabilitation practice.

## Motor Control

### What is Motor Control?

Motor control is the process by which the nervous system coordinates muscles and joints to produce purposeful movement.

### Theories of Motor Control

#### Reflex Theory
Movement is controlled by stimulus-response chains.
- **Limitation**: Cannot explain voluntary or spontaneous movements

#### Hierarchical Theory
Movement is organized from higher (cortex) to lower (spinal) centers.
- **Limitation**: Overly rigid, doesn't explain reflex modulation

#### Systems Theory (Bernstein)
Movement emerges from interaction of multiple subsystems working within environmental constraints.

#### Dynamic Systems Theory
Movement is self-organized based on constraints of the individual, task, and environment.

#### Motor Program Theory
Central pattern generators and generalized motor programs store movement patterns.

### Clinical Application

Understanding these theories helps clinicians:
- Analyze movement dysfunctions
- Design targeted interventions
- Progress rehabilitation appropriately

## Motor Learning

### Stages of Motor Learning (Fitts & Posner)

1. **Cognitive Stage**: Understanding the task
   - High attention demand
   - Inconsistent performance
   - Frequent errors

2. **Associative Stage**: Refining the movement
   - Reduced attention demand
   - More consistent performance
   - Fewer errors

3. **Autonomous Stage**: Automatic performance
   - Minimal attention demand
   - Consistent, efficient movement
   - Ability to dual-task

### Types of Practice

| Practice Type | Description | Best For |
|---------------|-------------|----------|
| Blocked | Same task repeatedly | Early learning (cognitive stage) |
| Random | Mixed tasks in random order | Retention and transfer |
| Variable | Same skill, different conditions | Adaptability |
| Constant | Same skill, same conditions | Skill acquisition |

### Feedback Strategies

#### Knowledge of Results (KR)
Information about the outcome of the movement.

#### Knowledge of Performance (KP)
Information about the quality or pattern of movement.

**Feedback Schedules**:
- **100% Feedback**: Good for acquisition, poor for retention
- **Faded Feedback**: Gradually reduce frequency — best for long-term learning
- **Bandwidth Feedback**: Provide feedback only when error exceeds threshold
- **Self-Controlled Feedback**: Learner chooses when to receive feedback

### Transfer of Learning

- **Positive Transfer**: Previous learning facilitates new learning
- **Negative Transfer**: Previous learning interferes with new learning
- **Near Transfer**: Similar contexts
- **Far Transfer**: Different contexts

## Practical Applications

### For Impaired Motor Control

- Reduce degrees of freedom initially
- Provide external focus of attention
- Use manual guidance appropriately
- Progress from stable to unstable surfaces

### For Motor Learning

- Use random practice for retention
- Provide feedback judiciously (faded schedule)
- Encourage problem-solving
- Vary practice conditions

## Conclusion

Applying motor learning principles — particularly feedback scheduling, practice structure, and attention focus — significantly enhances rehabilitation outcomes. A skilled clinician moves beyond simply prescribing exercises to strategically manipulating learning variables.`,
        tags: ['motor control', 'motor learning', 'neurorehabilitation', 'movement science'],
        references: ['https://pubmed.ncbi.nlm.nih.gov/'],
        status: 'published',
      },
      {
        title: 'Electrotherapy Modalities: Evidence and Application',
        slug: 'electrotherapy-modalities',
        category: 'Treatment Techniques',
        excerpt: 'Evidence-based review of common electrotherapy modalities including TENS, interferential current, ultrasound, and neuromuscular electrical stimulation.',
        body: `# Electrotherapy Modalities

## Introduction

Electrotherapy encompasses a range of modalities that use electrical energy for therapeutic purposes. While some modalities have strong evidence, others remain controversial.

## Transcutaneous Electrical Nerve Stimulation (TENS)

### Mechanism
- **High-frequency (80-100 Hz)**: Activates A-beta fibers, gate control
- **Low-frequency (2-4 Hz)**: Activates descending inhibitory pathways

### Evidence
- Effective for acute and chronic pain
- Strongest evidence for postoperative pain
- Moderate evidence for chronic musculoskeletal pain
- Weak evidence for neuropathic pain

### Parameters
- Pulse width: 50-200 μs
- Intensity: Strong but comfortable
- Duration: 30-60 minutes
- Electrode placement: Over or around painful area

## Interferential Current (IFC)

### Mechanism
Two medium-frequency currents (4000 Hz) interfere at depth to create a low-frequency (1-150 Hz) therapeutic effect.

### Evidence
- Similar to TENS for pain relief
- May penetrate deeper tissues
- Evidence quality is moderate

### Parameters
- Carrier frequency: 4000 Hz
- Beat frequency: 80-150 Hz for pain, 0-10 Hz for muscle stimulation
- Sweep mode to reduce accommodation

## Neuromuscular Electrical Stimulation (NMES)

### Mechanism
Depolarizes motor nerves to produce muscle contraction.

### Evidence
- Strong evidence for quadriceps strengthening after ACLR
- Moderate evidence for reducing muscle atrophy during immobilization
- Useful for facilitating voluntary muscle activation

### Parameters
- Frequency: 30-80 Hz
- Pulse width: 200-400 μs
- On:Off ratio: 1:3 to 1:5
- Intensity: To visible contraction or tolerance
- Duration: 10-20 contractions, 2-3x daily

## Therapeutic Ultrasound (US)

### Mechanism
High-frequency sound waves produce thermal and non-thermal effects.

### Evidence
- Thermal US: Moderate evidence for joint contracture, pain
- Non-thermal US: Weak evidence for tissue healing
- Overall: Evidence is limited and mixed

### Parameters
- Frequency: 1 MHz (deep, 3-5 cm), 3 MHz (superficial, 1-3 cm)
- Intensity: 0.5-2.0 W/cm²
- Duty cycle: 20-50% (non-thermal), 100% (thermal)
- Duration: 5-10 minutes per treatment area

## Contraindications for Electrotherapy

**Absolute**:
- Cardiac pacemaker
- Pregnancy (over abdomen/back)
- Malignancy
- Over carotid sinus
- Thrombosis
- Impaired sensation

**Relative**:
- Epilepsy
- Metal implants
- Fracture site
- Skin irritation or open wounds

## Clinical Decision Making

| Condition | Preferred Modality | Evidence Level |
|-----------|-------------------|----------------|
| Acute postoperative pain | TENS | Strong |
| Chronic low back pain | TENS or IFC | Moderate |
| Quadriceps inhibition | NMES | Strong |
| Joint contracture | Thermal US | Moderate |
| Acute inflammation | Cryotherapy (not electrotherapy) | Strong |

## Conclusion

Electrotherapy modalities are adjunctive tools in physiotherapy. While TENS and NMES have strong evidence for specific indications, other modalities have more limited support. Clinical reasoning should prioritize active interventions and use electrotherapy as a supplement rather than a standalone treatment.`,
        tags: ['electrotherapy', 'TENS', 'NMES', 'ultrasound', 'modalities'],
        references: ['https://pubmed.ncbi.nlm.nih.gov/'],
        status: 'published',
      },
      {
        title: 'Orthopedic Assessment of the Knee Joint',
        slug: 'orthopedic-assessment-knee',
        category: 'Assessment',
        excerpt: 'Systematic approach to orthopedic assessment of the knee including special tests, differential diagnosis, and clinical reasoning.',
        body: `# Orthopedic Assessment of the Knee

## Introduction

The knee is one of the most commonly injured joints in the body. A systematic assessment approach helps clinicians accurately diagnose pathology and guide treatment decisions.

## Subjective Examination

### Key Questions
- Mechanism of injury (contact vs. non-contact)
- Location of pain (anterior, posterior, medial, lateral)
- Presence of swelling (immediate vs. delayed)
- Mechanical symptoms (locking, catching, giving way)
- Instability episodes
- Previous injuries and surgeries

### Red Flags
- Inability to bear weight
- Locked knee (meniscal bucket handle tear)
- Knee effusion with fever (septic arthritis)
- Night pain (tumor)

## Objective Examination

### Observation
- Gait pattern
- Alignment (varus, valgus, recurvatum)
- Swelling and effusion
- Quadriceps atrophy
- Bruising or discoloration

### Range of Motion
- Active and passive
- Extension: Normal 0° (hyperextension 5-10°)
- Flexion: Normal 135-150°

### Palpation
- Joint line tenderness (medial/lateral)
- Patellar facets
- Collateral ligaments
- Pes anserine bursa
- Popliteal fossa

## Special Tests

### Ligament Tests

| Test | Target | Sensitivity | Specificity |
|------|--------|-------------|-------------|
| Lachman | ACL | 87% | 93% |
| Anterior Drawer | ACL | 55% | 92% |
| Posterior Drawer | PCL | 90% | 99% |
| Valgus Stress | MCL | 86% | 93% |
| Varus Stress | LCL | 67% | 97% |

### Meniscal Tests

| Test | Sensitivity | Specificity |
|------|-------------|-------------|
| McMurray | 61% | 84% |
| Apley Compression | 53% | 71% |
| Thessaly | 75% | 86% |
| Joint Line Tenderness | 76% | 77% |

### Patellofemoral Tests
- **Clarke's Sign**: Patellar grind test
- **Patellar Apprehension**: For instability/subluxation
- **Q-Angle**: Normal < 15° in women, < 10° in men
- **Lateral Patellar Glide**: Assess tightness

## Diagnostic Imaging

### When to Image
- Unable to bear weight + immediate effusion → X-ray (Ottawa Knee Rules)
- Suspected fracture → X-ray
- Persistent instability → MRI
- Locking or catching → MRI

### Ottawa Knee Rules
X-ray required if:
- Age > 55
- Isolated patellar tenderness
- Fibular head tenderness
- Unable to flex to 90°
- Unable to bear weight for 4 steps

## Common Knee Conditions

| Condition | Key Features |
|-----------|--------------|
| ACL Tear | Non-contact pivot, immediate effusion, positive Lachman |
| PCL Tear | Dashboard injury, posterior sag |
| MCL Sprain | Valgus force, medial pain, stable with intact ACL |
| Medial Meniscus Tear | Twisting injury, joint line pain, locking |
| Patellofemoral Pain | Anterior pain, stairs/squatting, no effusion |

## Conclusion

A thorough knee assessment combines subjective history, observation, range of motion testing, and selective special tests. No single test is perfect — the clinical picture emerges from integrating all findings.`,
        tags: ['knee', 'orthopedic assessment', 'special tests', 'physical examination'],
        references: ['https://pubmed.ncbi.nlm.nih.gov/'],
        status: 'published',
      },
      {
        title: 'Respiratory Physiotherapy: Airway Clearance Techniques',
        slug: 'respiratory-physiotherapy-airway-clearance',
        category: 'Clinical Practice',
        excerpt: 'Evidence-based airway clearance techniques for patients with respiratory conditions including COPD, cystic fibrosis, and post-surgical complications.',
        body: `# Respiratory Physiotherapy: Airway Clearance Techniques

## Introduction

Airway clearance techniques (ACTs) are essential interventions for patients with excessive or retained secretions. They are indicated in conditions such as cystic fibrosis, bronchiectasis, COPD, and post-operative atelectasis.

## Physiological Basis

Effective airway clearance depends on:
- **Mucus production**: Balanced hydration and production
- **Mucociliary clearance**: Functioning cilia and thin mucus
- **Cough effectiveness**: Strong expiratory muscles and open airways
- **Airway patency**: Open airways for airflow

## Airway Clearance Techniques

### 1. Postural Drainage

Using gravity to drain secretions from specific lung segments.

**Positions for specific lobes**:
- **Upper lobes**: Upright or semi-reclining
- **Middle lobe**: Head down, lying on back (15° Trendelenburg)
- **Lower lobes**: Head down, prone or side-lying (30-45° Trendelenburg)

**Duration**: 5-15 minutes per position
**Cautions**: GERD, head injury, elevated ICP, hypotension

### 2. Percussion and Vibration

- **Percussion**: Rhythmic clapping with cupped hands over the affected segment
- **Vibration**: Gentle shaking during exhalation
- **Frequency**: 3-5 minutes per position

### 3. Active Cycle of Breathing Technique (ACBT)

A three-phase cycle:
1. **Breathing Control**: Normal tidal breathing, relaxation
2. **Thoracic Expansion Exercises**: Deep breaths with 3-second breath hold
3. **Forced Expiration Technique (FET)**: 1-2 huffs followed by breathing control

### 4. Autogenic Drainage (AD)

Breathing at three volume levels:
1. **Unstick phase**: Low lung volumes to mobilize peripheral secretions
2. **Collect phase**: Mid lung volumes to collect secretions
3. **Evacuate phase**: High lung volumes to clear secretions

### 5. Positive Expiratory Pressure (PEP)

Breathing out against resistance (10-20 cmH₂O) to:
- Splint airways open
- Improve ventilation behind secretions
- Enhance mucus clearance

### 6. Oscillating PEP (e.g., Acapella, Flutter)

Combines PEP with airway oscillation to enhance secretion clearance.

### 7. High-Frequency Chest Wall Oscillation (HFCWO)

Mechanical vest that provides external chest oscillations.

## Technique Selection by Condition

| Condition | Preferred Technique | Frequency |
|-----------|-------------------|-----------|
| Cystic Fibrosis | AD, ACBT, HFCWO | 1-2x daily |
| Bronchiectasis | ACBT, PEP, AD | 1-2x daily |
| COPD | ACBT, PEP | As needed |
| Post-surgical | ACBT, incentive spirometry | 2-4x daily |
| Neuromuscular disease | Mechanical insufflation-exsufflation (MI-E) | 2-4x daily |

## Outcome Measures

- **Peak expiratory cough flow**: > 160 L/min effective
- **Oxygen saturation**: Improvement or maintenance
- **Sputum weight/volume**: Measured clearance
- **Dyspnea rating**: Modified Borg Scale
- **Chest X-ray**: Clearance confirmation

## Contraindications

- Rib fracture
- Unstable spine
- Increased ICP
- Active hemoptysis
- Pulmonary embolism
- Recent pneumothorax

## Conclusion

Airway clearance techniques are effective interventions for patients with retained secretions. The choice of technique depends on the patient's condition, preferences, and specific needs. Combining multiple techniques often yields the best results.`,
        tags: ['respiratory', 'airway clearance', 'physiotherapy', 'chest physiotherapy'],
        references: ['https://pubmed.ncbi.nlm.nih.gov/'],
        status: 'published',
      },
      {
        title: 'Stroke Rehabilitation: Evidence-Based Interventions',
        slug: 'stroke-rehabilitation',
        category: 'Clinical Practice',
        excerpt: 'Evidence-based physiotherapy interventions for stroke rehabilitation across the continuum of care from acute to community settings.',
        body: `# Stroke Rehabilitation

## Introduction

Stroke is a leading cause of disability worldwide. Physiotherapy plays a crucial role in maximizing functional recovery and improving quality of life after stroke.

## Phases of Stroke Rehabilitation

### Acute Phase (0-7 days)

**Focus**: Prevention of complications, early mobilization

- Positioning and handling
- Passive range of motion
- Respiratory care
- Early mobilization (as tolerated)
- Family education

### Subacute Phase (1 week - 6 months)

**Focus**: Neurorecovery, functional retraining, compensation strategies

- Task-specific training
- Gait rehabilitation
- Upper limb rehabilitation
- Balance training
- Spasticity management

### Chronic Phase (>6 months)

**Focus**: Community reintegration, maintenance, adaptation

- Community mobility
- Leisure activities
- Home exercise program
- Secondary prevention
- Environmental modifications

## Key Interventions

### Task-Specific Training

Repeated practice of meaningful, real-world tasks:
- Reaching and grasping
- Sit-to-stand
- Walking on different surfaces
- Stair climbing

### Constraint-Induced Movement Therapy (CIMT)

Restricting the unaffected upper limb to force use of the affected limb.

**Protocol**: 6 hours/day, 5 days/week for 2 weeks
**Evidence**: Strong for improving upper limb function

### Gait Training

- **Body Weight Support Treadmill Training (BWSTT)**
- **Overground gait training**
- **Functional electrical stimulation (FES)** for foot drop
- **Orthotics** (AFO for foot drop)

### Balance Training

- Weight shifting exercises
- Reaching activities
- Perturbation training
- Dual-task training
- Tai Chi and yoga

### Spasticity Management

**Non-pharmacological**:
- Stretching and positioning
- Serial casting
- Electrical stimulation

**Pharmacological**:
- Botulinum toxin injections (focal)
- Oral medications (generalized)

## Predicting Recovery

### Upper Limb
Presence of any finger extension within 72 hours → good recovery
No motor function at 4 weeks → poor prognosis

### Lower Limb
Early sitting balance → better walking recovery
No hip flexion at 6 weeks → limited walking

## Outcome Measures

| Domain | Measure |
|--------|---------|
| Global disability | Modified Rankin Scale |
| Motor impairment | Fugl-Meyer Assessment |
| Balance | Berg Balance Scale |
| Gait | 10-Meter Walk Test, 6MWT |
| ADL | Barthel Index, FIM |
| Quality of life | Stroke Impact Scale |

## Conclusion

Stroke rehabilitation requires a multidisciplinary approach with high-intensity, task-specific training. Recovery continues for years, and physiotherapists play a vital role throughout the continuum of care.`,
        tags: ['stroke', 'neurological rehabilitation', 'hemiplegia', 'gait training'],
        references: ['https://pubmed.ncbi.nlm.nih.gov/'],
        status: 'published',
      },
      {
        title: 'Managing Patellofemoral Pain Syndrome',
        slug: 'patellofemoral-pain-syndrome',
        category: 'Pathology',
        excerpt: 'Evidence-based approach to assessing and managing patellofemoral pain syndrome including exercise therapy, taping, and activity modification.',
        body: `# Patellofemoral Pain Syndrome

## Introduction

Patellofemoral pain syndrome (PFPS) is one of the most common knee conditions, particularly affecting young, active individuals and females. It accounts for 25-40% of all knee injuries in sports medicine clinics.

## Etiology and Risk Factors

### Proximal Factors
- Hip abductor weakness (gluteus medius)
- Hip external rotator weakness
- Poor core stability
- Excessive femoral internal rotation

### Local Factors
- Vastus medialis obliquus (VMO) dysfunction
- Lateral retinacular tightness
- Patellar hypermobility or hypomobility
- Patella alta

### Distal Factors
- Excessive foot pronation
- Tibial rotation
- Tight gastrocnemius/soleus

## Clinical Presentation

- Anterior or retropatellar knee pain
- Aggravated by: stairs, squatting, kneeling, prolonged sitting
- Crepitus with knee flexion/extension
- No mechanical symptoms (locking, giving way)
- No significant effusion

## Assessment

### Subjective
- Pain location and nature
- Aggravating activities
- Previous treatments and response
- Activity level and goals

### Objective

**Observation**:
- Q-angle (> 15° women, > 10° men)
- Squat assessment (knee collapse, foot pronation)
- Step-down test

**Special Tests**:
- Clarke's sign (patellar grind test)
- Patellar tilt test
- Patellar glide test (medial/lateral)
- Waldron's test (patellar compression)

**Muscle Testing**:
- Hip abductor strength
- Hip external rotation strength
- VMO timing and activation

## Evidence-Based Management

### Exercise Therapy (Strong Evidence)

**Phase 1: Pain Management**
- Pain-free isometric quadriceps
- Activity modification (reduce aggravating activities)
- Ice after activity

**Phase 2: Hip and Knee Strengthening**
- Hip abduction and external rotation (clamshells, side-lying leg raises)
- VMO activation (terminal knee extension, mini-squats)
- Progressive loading (squats, lunges within pain-free range)

**Phase 3: Functional Retraining**
- Squat re-training (knee-over-toe, hip loading)
- Step-down control
- Landing mechanics
- Sport-specific movements

### Patellar Taping (Moderate Evidence)

- McConnell taping to medially glide the patella
- Can reduce pain immediately during activity
- Used as adjunct to exercise, not substitute

### Orthotics (Limited Evidence)

- For patients with excessive foot pronation
- Over-the-counter arch supports may help

## Prognosis

- 60-80% improve with conservative care
- Recovery typically takes 6-12 weeks
- Recurrence rate is high (40%)
- Poor prognostic factors: bilateral symptoms, long duration, high activity level

## When to Refer

- Failure to improve after 12 weeks
- Suspicion of patellar instability
- Locking or catching (rule out plica or loose body)
- Significant effusion (rule out other pathology)

## Conclusion

PFPS responds well to a comprehensive program addressing hip and knee strengthening, activity modification, and movement re-education. Patellar taping provides symptomatic relief but exercise is the cornerstone of treatment.`,
        tags: ['PFPS', 'patellofemoral', 'knee pain', 'VMO', 'rehabilitation'],
        references: ['https://pubmed.ncbi.nlm.nih.gov/'],
        status: 'published',
      },
      {
        title: 'Proprioception and Neuromuscular Control in Rehabilitation',
        slug: 'proprioception-neuromuscular-control',
        category: 'Kinesiology',
        excerpt: 'Understanding proprioception, neuromuscular control, and their integration into rehabilitation programs for joint injuries.',
        body: `# Proprioception and Neuromuscular Control

## Introduction

Proprioception — the sense of joint position and movement — is essential for normal motor function. After injury, proprioceptive deficits contribute to re-injury risk. Training neuromuscular control is a critical component of comprehensive rehabilitation.

## What is Proprioception?

Proprioception encompasses:
- **Joint Position Sense (JPS)**: Ability to reproduce joint angles
- **Kinesthesia**: Sensation of joint movement
- **Force Sense**: Ability to sense force production
- **Velocity Sense**: Sensation of movement speed

## Neural Pathways

### Peripheral Receptors

| Receptor | Location | Function |
|----------|----------|----------|
| Muscle Spindles | Intrafusal fibers | Length and velocity |
| Golgi Tendon Organs | Muscle-tendon junction | Tension |
| Ruffini Endings | Joint capsule, ligaments | Position, pressure |
| Pacinian Corpuscles | Joint capsule | Acceleration, vibration |
| Free Nerve Endings | Throughout | Nociception |

### Central Processing

1. **Spinal Level**: Stretch reflexes, reciprocal inhibition
2. **Brainstem**: Postural control, vestibulospinal reflexes
3. **Cerebellum**: Coordination, error correction
4. **Cortex**: Voluntary movement, conscious awareness

## Effects of Injury on Proprioception

- **Ligamentous Injury**: Disrupts mechanoreceptors
- **Muscle Injury**: Alters spindle sensitivity
- **Joint Effusion**: Inhibits receptors
- **Pain**: Alters afferent input
- **Immobilization**: Decreases receptor sensitivity

## Neuromuscular Control

Neuromuscular control is the unconscious, coordinated response to proprioceptive input. It involves:

1. **Feedforward Control**: Anticipatory muscle activation
2. **Feedback Control**: Reactive adjustments to perturbations
3. **Reflex Pathways**: Automatic protective responses

## Training Methods

### Phase 1: Static Balance (Week 1-2)
- Single leg stance (eyes open → closed)
- Perturbation on stable surface
- Weight shifting

### Phase 2: Dynamic Balance (Week 2-4)
- Single leg on unstable surface (foam, BOSU)
- Reaching activities on single leg
- Ball toss while balance

### Phase 3: Perturbation Training (Week 4-6)
- Unexpected perturbations
- Wobble board and rocker board
- Athletic stance perturbations

### Phase 4: Sport-Specific (Week 6+)
- Cutting and pivoting
- Jump-landing mechanics
- Reactive agility drills

## Evidence by Joint

| Joint | Key Finding |
|-------|-------------|
| **Ankle** | Proprioceptive training reduces recurrent sprain risk by 36% |
| **Knee** | Neuromuscular training reduces ACL injury risk by 50% in female athletes |
| **Shoulder** | Joint position sense training improves outcomes after instability |
| **Spine** | Motor control training reduces low back pain recurrence |

## Conclusion

Proprioception and neuromuscular control are critical components of rehabilitation, particularly for injury prevention and return to sport. Training should progress from simple to complex, static to dynamic, and predictable to unpredictable.`,
        tags: ['proprioception', 'neuromuscular control', 'balance', 'injury prevention'],
        references: ['https://pubmed.ncbi.nlm.nih.gov/'],
        status: 'published',
      },
      {
        title: 'Geriatric Physiotherapy: Assessment and Management',
        slug: 'geriatric-physiotherapy',
        category: 'Clinical Practice',
        excerpt: 'Evidence-based approach to physiotherapy assessment and management of older adults including falls prevention and frailty management.',
        body: `# Geriatric Physiotherapy

## Introduction

The global population is aging rapidly. Physiotherapists play a critical role in maintaining function, independence, and quality of life in older adults.

## Age-Related Changes

### Musculoskeletal
- Sarcopenia: 3-8% muscle mass loss per decade after 30
- Bone density loss: Accelerated after menopause
- Tendon stiffness: Reduced elasticity
- Cartilage degeneration: Increased osteoarthritis

### Neurological
- Slowed nerve conduction velocity
- Reduced proprioception
- Impaired balance reactions
- Decreased reaction time

### Cardiovascular
- Reduced maximal heart rate
- Decreased cardiac output
- Increased blood pressure
- Reduced VO2 max

### Respiratory
- Decreased lung elasticity
- Reduced chest wall compliance
- Weaker respiratory muscles

## Comprehensive Geriatric Assessment

### Functional Assessment
- **Katz Index of ADL**: Bathing, dressing, toileting, transferring, continence, feeding
- **Lawton IADL Scale**: Phone, shopping, cooking, housekeeping, laundry, transportation, medications, finances
- **Timed Up and Go (TUG)**: > 12 seconds = fall risk
- **Gait Speed**: < 0.8 m/s = frailty marker

### Balance Assessment
- **Berg Balance Scale**: 0-56, < 45 = fall risk
- **Functional Reach Test**: < 15 cm = fall risk
- **Four-Stage Balance Test**: Unable to stand on one foot > 5 seconds
- **Tinetti Performance-Oriented Mobility Assessment (POMA)**

### Fall Risk Assessment
**STEADI Algorithm** (CDC):
1. Ask about falls in past year
2. If yes: Perform multifactorial assessment
3. If no but unsteady gait: Perform TUG

## Key Interventions

### Falls Prevention (Strong Evidence)
- **Exercise**: Balance + strength training, 3+ hours/week
- **Tai Chi**: Reduces falls by 30-50%
- **Otago Exercise Program**: Home-based, prescribed by PT
- **Environmental modification**: Home assessment and adaptation
- **Medication review**: Particularly sedatives and antihypertensives

### Frailty Management
- **Resistance training**: 2-3x/week, 8-10 exercises, 10-15 reps
- **Protein supplementation**: 1.2-1.5 g/kg/day
- **Vitamin D**: 800-1000 IU/day
- **Multicomponent programs**: Strength + balance + walking

### Osteoarthritis Management
- **Exercise**: Aerobic + strengthening = moderate evidence
- **Weight management**: 5-10% weight loss reduces pain
- **Walking aids**: Reduce joint loading
- **Manual therapy**: For specific impairments

### Osteoporosis Management
- **Weight-bearing exercise**: Walking, stair climbing
- **Resistance training**: Spinal extension exercises
- **Postural correction**: Kyphosis management
- **Balance training**: Fall prevention (reduces fracture risk)

## Special Considerations

### Frailty Phenotype (Fried Criteria)
3+ of: unintentional weight loss, exhaustion, low physical activity, slow gait speed, weakness

### Sarcopenia Diagnosis
Low muscle mass + low muscle strength + low physical performance

### Cognitive Impairment
- Simplify instructions
- Use external cues
- Involve caregivers
- Focus on functional tasks

## Conclusion

Geriatric physiotherapy requires a comprehensive, individualized approach addressing strength, balance, mobility, and function. Falls prevention and frailty management are high-impact areas where physiotherapy intervention significantly improves outcomes.`,
        tags: ['geriatrics', 'falls prevention', 'frailty', 'older adults', 'osteoporosis'],
        references: ['https://pubmed.ncbi.nlm.nih.gov/'],
        status: 'published',
      },
      {
        title: 'Temporomandibular Joint Disorders: Physiotherapy Management',
        slug: 'temporomandibular-joint-disorders',
        category: 'Treatment Techniques',
        excerpt: 'Assessment and physiotherapy management of temporomandibular joint disorders including manual therapy and exercise.',
        body: `# Temporomandibular Joint Disorders

## Introduction

Temporomandibular joint disorders (TMD) affect 5-12% of the population and are the most common cause of chronic orofacial pain. Physiotherapy is an effective first-line treatment.

## Anatomy

The TMJ is a complex synovial joint with:
- **Articular surfaces**: Mandibular condyle and temporal bone fossa
- **Articular disc**: Biconcave fibrocartilage that divides the joint
- **Joint capsule**: Loose, allows extensive movement
- **Ligaments**: Temporomandibular, sphenomandibular, stylomandibular

### Normal Movement
- **Opening**: 35-50 mm (normal), rotation then translation
- **Lateral deviation**: 8-12 mm
- **Protrusion**: 6-9 mm

## Classification of TMD

### Myogenous (50%)
Pain originating from masticatory muscles (masseter, temporalis, pterygoids)

### Arthrogenous (20%)
Pain from the joint itself (disc displacement, osteoarthritis, capsulitis)

### Mixed (30%)
Both muscular and joint involvement

## Assessment

### Subjective
- Pain location and quality
- Clicking, popping, crepitus
- Locking (open or closed)
- Bruxism (clenching, grinding)
- Headache, ear pain, tinnitus
- Cervical spine involvement

### Objective

**Range of Motion**:
- Pain-free opening
- Maximum opening
- Lateral deviation
- Protrusion

**Palpation**:
- Lateral pole of condyle
- Masseter, temporalis, pterygoids
- Cervical spine

**Dynamic Tests**:
- Load test (unloading the joint)
- Compression test

## Physiotherapy Interventions

### Education and Self-Management
- Diet modification (soft foods initially)
- Parafunctional habit awareness
- Sleep posture optimization
- Relaxation techniques

### Manual Therapy
- **Intra-oral**: Masseter and pterygoid release
- **Extra-oral**: Joint mobilization, muscle inhibition
- **Cervical spine**: Upper cervical mobilization (TMD and neck are linked)

### Exercise Therapy

**Mobility Exercises**:
- Controlled opening (tongue on palate)
- Lateral deviation with resistance
- Reciprocal click resolution

**Motor Control**:
- Unloading pattern (retrusion)
- Stabilization exercises
- Coordination training

### Physical Agents
- **Ultrasound**: For myofascial trigger points
- **TENS**: For pain relief
- **LASER**: Moderate evidence for pain reduction

## Outcome Measures

- **Jaw Functional Limitation Scale (JFLS)**
- **Graded Chronic Pain Scale (GCPS)**
- **Pain-free opening (mm)**
- **Maximum opening (mm)**

## Red Flags

- Fever or swelling (infection)
- Unexplained weight loss
- Otalgia with normal TMJ exam
- Neurological symptoms (trigeminal neuralgia)
- Previous head/neck cancer

## Conclusion

TMD management requires a multimodal approach including education, manual therapy, and exercise. The cervical spine should always be assessed as cervicogenic pain can mimic TMD. Most patients improve with conservative physiotherapy.`,
        tags: ['TMJ', 'TMD', 'orofacial pain', 'jaw', 'manual therapy'],
        references: ['https://pubmed.ncbi.nlm.nih.gov/'],
        status: 'published',
      },
      {
        title: 'Sports Injury Prevention: Principles and Programs',
        slug: 'sports-injury-prevention',
        category: 'Clinical Practice',
        excerpt: 'Evidence-based sports injury prevention principles and proven programs for reducing injury risk in athletes.',
        body: `# Sports Injury Prevention

## Introduction

Injury prevention is a core responsibility of sports physiotherapists. Effective prevention programs can reduce injury rates by 30-50% across various sports.

## The Injury Prevention Model

### Step 1: Establish the Extent of the Problem
- Injury incidence (injuries per 1000 hours)
- Injury severity (time loss)
- Injury patterns (type, location, mechanism)

### Step 2: Establish Mechanism and Risk Factors

**Intrinsic Risk Factors**:
- Age, sex, previous injury
- Strength, flexibility, balance
- Neuromuscular control
- Biomechanics (movement patterns)

**Extrinsic Risk Factors**:
- Training load (volume, intensity, frequency)
- Equipment (footwear, protective gear)
- Playing surface
- Rules and regulations

### Step 3: Develop and Implement Preventive Measures

### Step 4: Assess Effectiveness

## Evidence-Based Prevention Programs

### FIFA 11+ (Soccer)

A 20-minute warm-up program:
**Part 1**: Running exercises (8 min)
**Part 2**: Strength, plyometrics, balance (10 min)
- Core and hip strengthening
- Eccentric hamstring loading (Nordic curls)
- Single-leg balance
- Landing technique

**Part 3**: Running exercises (2 min)

**Effectiveness**: 30-50% reduction in all injuries, 50% reduction in ACL injuries

### Prevent Injury and Enhance Performance (PEP) Program

Developed for female soccer players:
- Warm-up and stretching
- Strength (Nordic curls, lunges)
- Plyometrics (jump training)
- Agility drills
- Education on high-risk movements

**Effectiveness**: 72% reduction in ACL injuries in female soccer players

### Nordic Hamstring Program

Eccentric hamstring training:
- 10-12 reps, 2-3x/week
- Progressive increase in load
- **Effectiveness**: 65% reduction in hamstring strains

## Key Prevention Components

### Neuromuscular Training
- Landing mechanics (knee-over-toe, hip flexion)
- Cutting and pivoting technique
- Deceleration training
- Core and hip strengthening

### Eccentric Training
- Hamstring: Nordic curls
- Calf: Eccentric heel drops (Achilles)
- Rotator cuff: Eccentric external rotation

### Load Management
- Acute:Chronic workload ratio: 0.8-1.3
- Weekly mileage increases < 10%
- Periodization and recovery

### Movement Screening
- **Functional Movement Screen (FMS)**: Composite score < 14 = injury risk
- **Landing Error Scoring System (LESS)**: Jump-landing quality
- **Y-Balance Test**: Asymmetry > 4 cm = injury risk

## Sport-Specific Recommendations

| Sport | Key Prevention Focus |
|-------|---------------------|
| Soccer | Hamstring, ACL, ankle sprains |
| Basketball | Ankle sprains, ACL, patellar tendinopathy |
| Running | Bone stress, patellofemoral pain, Achilles |
| Swimming | Shoulder impingement (rotator cuff) |
| Volleyball | Ankle sprains, shoulder, patellar tendinopathy |

## Conclusion

Injury prevention should be integrated into every athlete's training program. The most effective programs address neuromuscular control, eccentric strength, and load management while being sport-specific and consistently implemented.`,
        tags: ['sports medicine', 'injury prevention', 'FIFA 11+', 'neuromuscular training'],
        references: ['https://pubmed.ncbi.nlm.nih.gov/'],
        status: 'published',
      },
      {
        title: 'Evidence-Based Practice in Physiotherapy: A Practical Guide',
        slug: 'evidence-based-practice-physiotherapy',
        category: 'Clinical Practice',
        excerpt: 'A practical guide to integrating research evidence, clinical expertise, and patient values in physiotherapy decision-making.',
        body: `# Evidence-Based Practice in Physiotherapy

## Introduction

Evidence-based practice (EBP) is the integration of the best research evidence with clinical expertise and patient values. It is fundamental to modern physiotherapy practice.

## The Three Pillars of EBP

1. **Best Research Evidence**: High-quality, clinically relevant research
2. **Clinical Expertise**: Skills, experience, and clinical reasoning
3. **Patient Values and Preferences**: Individual patient's needs and expectations

## The 5-Step EBP Process

### Step 1: Ask a Clinical Question (PICO)

| Component | Description | Example |
|-----------|-------------|---------|
| **P**atient | Population and condition | Patients with chronic low back pain |
| **I**ntervention | Treatment being considered | Manual therapy |
| **C**omparison | Alternative treatment | Exercise alone |
| **O**utcome | Desired result | Pain reduction and functional improvement |

**Question**: "In patients with chronic low back pain, does manual therapy plus exercise compared to exercise alone result in greater pain reduction and functional improvement?"

### Step 2: Acquire the Evidence

**Hierarchy of Evidence**:

1. Systematic reviews and meta-analyses
2. Randomized controlled trials (RCTs)
3. Cohort studies
4. Case-control studies
5. Cross-sectional studies
6. Case series and case reports
7. Expert opinion and theory

**Key Databases**:
- **PubMed/MEDLINE**: Biomedical literature
- **CINAHL**: Nursing and allied health
- **PEDro**: Physiotherapy-specific
- **Cochrane Library**: Systematic reviews
- **Google Scholar**: Broad search

### Step 3: Appraise the Evidence (Critical Appraisal)

**Internal Validity**:
- Was the study randomized?
- Was allocation concealed?
- Were groups similar at baseline?
- Were assessors blinded?
- Was follow-up adequate (> 80%)?

**External Validity**:
- Are the participants similar to your patient?
- Is the intervention feasible in your setting?
- Are the outcomes clinically relevant?

**Clinical Importance**:
- Effect size (mean difference, risk ratio, odds ratio)
- Precision (confidence intervals)
- Number Needed to Treat (NNT)

### Step 4: Apply the Evidence

Integrate the evidence with:
- Your clinical expertise
- Patient preferences
- Clinical context
- Available resources

**Shared Decision Making**:
1. Present evidence in understandable terms
2. Discuss options and their pros/cons
3. Elicit patient preferences
4. Make a collaborative decision

### Step 5: Assess the Outcome

- Did the patient improve as expected?
- Was the intervention effective?
- What would you do differently next time?
- Document outcomes for future reference

## Common Evidence Pitfalls

### Confirmation Bias
Seeking evidence that confirms existing beliefs

### Publication Bias
Positive results are more likely to be published

### Outcome Reporting Bias
Selectively reporting favorable outcomes

### Overreliance on P-values
Statistical significance ≠ clinical significance

## EBP Resources

- **PEDro Scale**: Methodological quality (0-10)
- **GRADE**: Strength of recommendations
- **SIGN Guidelines**: Scottish Intercollegiate Guidelines
- **APTA Clinical Practice Guidelines**: Condition-specific
- **National Institute for Health and Care Excellence (NICE)**

## Conclusion

Evidence-based practice is not about rigidly following research protocols. It is about making informed clinical decisions by integrating the best available evidence with clinical judgment and patient preferences. EBP is a dynamic, ongoing process that improves patient outcomes and advances the profession.`,
        tags: ['evidence-based practice', 'critical appraisal', 'research', 'clinical reasoning'],
        references: ['https://pubmed.ncbi.nlm.nih.gov/', 'https://www.cochrane.org/', 'https://www.nice.org.uk/'],
        status: 'published',
      },
      {
        title: 'Lower Limb Amputation: Pre and Post-Operative Physiotherapy',
        slug: 'lower-limb-amputation-physiotherapy',
        category: 'Clinical Practice',
        excerpt: 'Physiotherapy management of patients undergoing lower limb amputation including pre-operative preparation, post-operative care, and prosthetic training.',
        body: `# Lower Limb Amputation: Physiotherapy Management

## Introduction

Lower limb amputation is a life-changing procedure. Physiotherapy plays a vital role throughout the patient journey — from pre-operative preparation through post-operative recovery and prosthetic rehabilitation.

## Pre-Operative Physiotherapy

**Goals**: Optimize fitness, educate, plan for post-op

- Upper body and core strengthening
- Cardiovascular conditioning
- Transfer training (bed mobility, sit-to-stand)
- Education about the surgical procedure and rehabilitation
- Psychological preparation and support
- Pre-prosthetic exercise program

**Outcome Measure**: Amputee Mobility Predictor (AMP)

## Post-Operative Care

### Wound and Stump Management

- **Positioning**: Prevent hip flexion contractures (prone lying)
- **Stump elevation**: Control edema (NOT with pillow under hip)
- **Stump bandaging**: Shrinking and shaping
- **Desensitization**: Gentle tapping, massage, textures
- **Scar management**: Mobilization, silicone sheets

**Critical**: Hip flexion contracture prevention is ESSENTIAL. Never position the stump on pillows in flexion.

### Pain Management

- **Phantom Limb Pain**: 60-80% of patients
  - Mirror therapy (strong evidence)
  - Graded motor imagery (moderate evidence)
  - TENS, acupuncture
  - Medications (gabapentin, amitriptyline)

- **Residual Limb Pain**: 50-70% of patients
  - Desensitization
  - TENS
  - Manual therapy to adjacent structures

### Early Mobility

- Bed mobility and transfers
- Wheelchair mobility
- Standing with frame (if appropriate)
- Balance training

## Prosthetic Training

### Pre-Prosthetic Phase
- Stump conditioning
- Range of motion maintenance
- Strengthening (hip extensors, abductors, core)
- Balance on sound limb

### Initial Prosthetic Training

**Phase 1: Static Standing**
- Weight shifting
- Equal weight bearing
- Postural alignment

**Phase 2: Dynamic Standing**
- Walking in parallel bars
- Gait retraining
- Turning and maneuvering

**Phase 3: Advanced Gait**
- Walking on uneven surfaces
- Stair climbing
- Community ambulation
- Fall recovery training

### Prosthetic Checklist

| Check | Normal | Problem |
|-------|--------|---------|
| Suspension | Secure fit | Pistoning/slipping |
| Alignment | Symmetrical gait | Pelvic obliquity, trunk lean |
| Socket fit | Comfortable, no pressure | Pain, redness, skin breakdown |
| Foot | Appropriate for activity | Too stiff/flexible |

## Levels of Amputation

| Level | Functional Outcome | Energy Cost vs. Normal |
|-------|-------------------|----------------------|
| Partial Foot | Minimal deficit | 0-10% increase |
| Transtibial (BKA) | Good ambulation | 25-40% increase |
| Transfemoral (AKA) | Moderate function | 60-100% increase |
| Hip Disarticulation | Limited function | > 100% increase |

## Outcome Measures

- **Amputee Mobility Predictor (AMP)**
- **Locomotor Capabilities Index (LCI)**
- **6-Minute Walk Test (6MWT)**
- **Timed Up and Go (TUG)**
- **Activities of Daily Living (ADL) assessment**

## Conclusion

Lower limb amputation rehabilitation requires a comprehensive, phased approach. Early intervention focusing on contracture prevention, pain management, and psychological support is as important as the prosthetic training that follows.`,
        tags: ['amputation', 'prosthetics', 'gait training', 'phantom limb pain', 'rehabilitation'],
        references: ['https://pubmed.ncbi.nlm.nih.gov/'],
        status: 'published',
      },
    ];

    // Create admin user (before articles since articles reference author)
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@physioai.online',
      password: hashedPassword,
      role: 'admin',
      tier: 'pro',
      dailyQuestionCount: 0,
      lastDailyReset: new Date(),
      emailVerified: new Date(),
    });
    console.log('Created admin user (admin@physioai.online / admin123)');

    for (const articleData of articlesData) {
      const categoryId = categoryMap.get(articleData.category);
      if (!categoryId) {
        console.log(`Skipping article "${articleData.title}": category "${articleData.category}" not found`);
        continue;
      }

      await Article.create({
        ...articleData,
        category: categoryId,
        author: adminUser._id,
        publishedAt: articleData.status === 'published' ? new Date() : undefined,
      });
    }

    console.log(`Created ${articlesData.length} articles`);

    // Create test users
    const freeUser = await User.create({
      name: 'Free User',
      email: 'free@test.com',
      password: await bcrypt.hash('test123', 12),
      role: 'user',
      tier: 'free',
      dailyQuestionCount: 3,
      lastDailyReset: new Date(),
      emailVerified: new Date(),
    });
    console.log('Created free test user (free@test.com / test123)');

    const premiumUser = await User.create({
      name: 'Premium User',
      email: 'premium@test.com',
      password: await bcrypt.hash('test123', 12),
      role: 'user',
      tier: 'premium',
      dailyQuestionCount: 0,
      lastDailyReset: new Date(),
      emailVerified: new Date(),
    });
    console.log('Created premium test user (premium@test.com / test123)');

    console.log('Database seeded successfully!');
    console.log('\nTest Accounts:');
    console.log('  Admin: admin@physioai.online / admin123');
    console.log('  Free:  free@test.com / test123');
    console.log('  Premium: premium@test.com / test123');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
  }
}

// Run the seed
seedDatabase().catch(console.error);
