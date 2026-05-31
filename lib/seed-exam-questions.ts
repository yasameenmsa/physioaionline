import mongoose from 'mongoose';
import { connectDB } from './db';
import Question from '../models/Question';
import Category from '../models/Category';

interface ExamQuestionInput {
  questionText: string;
  category: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  source: string;
}

interface ExamData {
  exam_info: {
    title: string;
    source: string;
  };
  questions: ExamQuestionInput[];
}

const exams: ExamData[] = [
  {
    exam_info: {
      title: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
      source: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
    },
    questions: [
      {
        questionText:
          'A complete medical history should be conducted on all patients prior to initiating treatment. Questions asked during the patient history should not lead the patient. Which of the following questions would not be considered leading?',
        category: 'Assessment',
        options: [
          'Does this increase your pain?',
          'Does this alter your pain in any way?',
          'Does your pain increase at night?',
          'Does your pain increase with activity?',
        ],
        correctAnswer: 1,
        explanation:
          'The correct answer is \'Does this alter your pain in any way?\'. This is a key concept in physiotherapy practice and clinical assessment.',
        difficulty: 'medium',
        source: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
      },
      {
        questionText:
          'A young boy is an insulin dependent diabetic. What effect does exercise have on the patient\'s insulin requirements?',
        category: 'Clinical Practice',
        options: [
          'Exercise often reduces a patient\'s insulin requirements',
          'Exercise often increases a patient\'s insulin requirements',
          'Exercise has no effect on a patient\'s insulin requirements',
          'Exercise is contraindicated for insulin dependent diabetics',
        ],
        correctAnswer: 0,
        explanation:
          'The correct answer is \'Exercise often reduces a patient\'s insulin requirements\'. This is a key concept in physiotherapy practice and clinical assessment.',
        difficulty: 'medium',
        source: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
      },
      {
        questionText:
          'A patient with chronic obstructive pulmonary disease is referred to physical therapy. Which of the following pulmonary function test results would you not expect to see when compared to normal values?',
        category: 'Pathology',
        options: [
          'Decreased lung volume',
          'Decreased aspiratory capacity',
          'Increased vital capacity',
          'Carbon dioxide retention in arterial blood',
        ],
        correctAnswer: 2,
        explanation:
          'The correct answer is \'Increased vital capacity\'. This is a key concept in physiotherapy practice and clinical assessment.',
        difficulty: 'easy',
        source: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
      },
      {
        questionText:
          'A patient in a work hardening program is required to lift packages weighing approximately 30 pounds overhead to a conveyor belt. The patient can complete the task, but is unable of the following assumptions is most accurate?',
        category: 'Clinical Practice',
        options: [
          'Additional weight should be added to the packages which would promote lumbar stability',
          'The patient should continue lifting the 30 pound package because he will gradually become stronger',
          'The task is too easy for the patient',
          'The task is too difficult for the patient',
        ],
        correctAnswer: 3,
        explanation:
          'The correct answer is \'The task is too difficult for the patient\'. This is a key concept in physiotherapy practice and clinical assessment.',
        difficulty: 'hard',
        source: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
      },
      {
        questionText:
          'A patient recovering from a serious hamstring strain is isokinetically evaluated prior to returning to track competition. Results of the evaluation reveal peak torque measurements of 125 ft lbs with knee extension and 78 ft lbs with knee flexion at 180 degrees per second on the involved side. What conclusion can be made regarding the patient\'s ability to return to athletic competition?',
        category: 'Assessment',
        options: [
          'The patient\'s quadriceps and hamstring strength are appropriate for a return to athletic activities',
          'The patient\'s hamstring strength demonstrates the need for continued rehabilitation',
          'The patient\'s quadriceps/hamstring ratio is below acceptable levels for athletic activities',
          'Not enough information is given to make accurate determination of the patient\'s functional status',
        ],
        correctAnswer: 3,
        explanation:
          'The correct answer is \'Not enough information is given to make accurate determination of the patient\'s functional status\'. This is a key concept in physiotherapy practice and clinical assessment.',
        difficulty: 'hard',
        source: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
      },
      {
        questionText:
          'During an initial evaluation a physical therapist is looking for information regarding patient\'s general willingness to use an affected body part. What objective information would provide you with the necessary information?',
        category: 'Assessment',
        options: [
          'Bony palpation',
          'Active movement',
          'Passive movement',
          'Sensory testing',
        ],
        correctAnswer: 1,
        explanation:
          'The correct answer is \'Active movement\'. This is a key concept in physiotherapy practice and clinical assessment.',
        difficulty: 'easy',
        source: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
      },
      {
        questionText:
          'A therapist is treating a patient three weeks status post anterior cruciate ligament reconstruction. The patient has just seen their physician and has been told that he can discontinue the use of the straight leg immobilizer. The primary concern of the therapist at this stage in the patient\'s rehabilitation is?',
        category: 'Treatment Techniques',
        options: [
          'Protection of the graft?',
          'Improvement in dynamic leg control during ambulation',
          'Increase quadriceps strength',
          'Improvement in knee range of motion particularly into extension',
        ],
        correctAnswer: 0,
        explanation:
          'The correct answer is \'Protection of the graft?\'. This is a key concept in physiotherapy practice and clinical assessment.',
        difficulty: 'medium',
        source: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
      },
      {
        questionText:
          'The ability to monitor vital signs is a necessary component of a physical therapy assessment. The purpose of obtaining vital signs include all of the following except?',
        category: 'Assessment',
        options: [
          'Assisting in goal setting and treatment planning',
          'Contributing to the assessment of the effectiveness of treatment',
          'Determining the patient\'s rehabilitation potential',
          'Establishing a database of values for an individual patient',
        ],
        correctAnswer: 2,
        explanation:
          'The correct answer is \'Determining the patient\'s rehabilitation potential\'. This is a key concept in physiotherapy practice and clinical assessment.',
        difficulty: 'medium',
        source: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
      },
      {
        questionText:
          'A male physical therapist is evaluation a female diagnosed with subacromial bursitis. After taking a thorough history the therapist asks the patient to change into a gown so that he may begin to examine the shoulder. The patient seems very uneasy about this suggestion, but finally agrees to use the gown. The most appropriate immediate course of action would be to?',
        category: 'Clinical Practice',
        options: [
          'Continue the treatment without further delay',
          'Attempt to treat the patient without using the gown',
          'Bring a female staff member into the treatment room and continue with treatment',
          'Offer to transfer the patient to a female therapist',
        ],
        correctAnswer: 2,
        explanation:
          'The correct answer is \'Bring a female staff member into the treatment room and continue with treatment\'. This is a key concept in physiotherapy practice and clinical assessment.',
        difficulty: 'hard',
        source: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
      },
      {
        questionText:
          'improperly positioned wheelchair leg and footrests could result in?',
        category: 'Clinical Practice',
        options: [
          'Excessive pressure under the distal thigh',
          'Excessive pressure under the ischial tuberosities',
          'Contractures of the lower extremities',
          'All of the above',
        ],
        correctAnswer: 3,
        explanation:
          'The correct answer is \'All of the above\'. This is a key concept in physiotherapy practice and clinical assessment.',
        difficulty: 'easy',
        source: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
      },
      {
        questionText:
          'A physical therapist is evaluating a patient diagnosed with an acute posterior cruciate sprain. The mechanism of injury for the posterior cruciate is?',
        category: 'Assessment',
        options: [
          'A forceful landing on the anterior tibia with the knee hyperflexed',
          'An anteriority directed force applied to the tibia when the foot is fixed',
          'A valgus force applied to the knee when the foot is fixed',
          'Hyperextension, internal rotation of the leg with external rotation of the body',
        ],
        correctAnswer: 0,
        explanation:
          'The correct answer is \'A forceful landing on the anterior tibia with the knee hyperflexed\'. This is a key concept in physiotherapy practice and clinical assessment.',
        difficulty: 'medium',
        source: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
      },
      {
        questionText:
          'The knee bolt on an above knee prosthesis is usually rotated five degrees to account for?',
        category: 'Kinesiology',
        options: [
          'Internal rotation during swing phase',
          'External rotation during swing phase',
          'Internal rotation during stance phase',
          'External rotation during stance phase',
        ],
        correctAnswer: 0,
        explanation:
          'The correct answer is \'Internal rotation during swing phase\'. This is a key concept in physiotherapy practice and clinical assessment.',
        difficulty: 'easy',
        source: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
      },
      {
        questionText:
          'practical and helpful recommendations to avoid unnecessary litigation include all of the following. perhaps the most important of these is?',
        category: 'Clinical Practice',
        options: [
          'To conduct a thorough initial evaluation',
          'To instruct patients carefully in all exercise activities',
          'To keep the referring physician informed',
          'To maintain accurate and timely written records',
        ],
        correctAnswer: 3,
        explanation:
          'The correct answer is \'To maintain accurate and timely written records\'. This is a key concept in physiotherapy practice and clinical assessment.',
        difficulty: 'easy',
        source: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
      },
      {
        questionText:
          'A patient diagnosed with right shoulder adhesive capsulitis is limited to 25 degrees of external rotation. Which mobilization techniques would be indicated with this limitation?',
        category: 'Treatment Techniques',
        options: [
          'Lateral distraction and anterior glide',
          'Medial distraction and posterior glide',
          'Lateral distraction and posterior glide',
          'Medial distraction and inferior glide',
        ],
        correctAnswer: 0,
        explanation:
          'The correct answer is \'Lateral distraction and anterior glide\'. This is a key concept in physiotherapy practice and clinical assessment.',
        difficulty: 'medium',
        source: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
      },
      {
        questionText:
          'A former patient calls to ask for advice immediately after injuring his lower back in a work related accident. The patient explains that he can not bend down and touch his toes without severe pain and has muscle spasms throughout his entire lower back. You work in a state without direct access, but would like to help your former patient. The most appropriate response would be?',
        category: 'Clinical Practice',
        options: [
          'Explain to the patient that you would be happy to treat his condition,however since you haven\'t formally evaluated him it would be unfair to prescribe treatment over the phone',
          'Arrange a time for the patient to come into your clinic for immediate treatment',
          'Prescribe flexion exercises and ice every three hours',
          'Refer the patient to a qualified physician',
        ],
        correctAnswer: 3,
        explanation:
          'The correct answer is \'Refer the patient to a qualified physician\'. This is a key concept in physiotherapy practice and clinical assessment.',
        difficulty: 'hard',
        source: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
      },
      {
        questionText:
          'Which pulse site can be used to assess a patient in cardiac arrest and to monitor lower extremity circulation?',
        category: 'Assessment',
        options: ['Femoral', 'Pedal', 'Popliteal', 'Radial'],
        correctAnswer: 0,
        explanation:
          'The correct answer is \'Femoral\'. This is a key concept in physiotherapy practice and clinical assessment.',
        difficulty: 'easy',
        source: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
      },
      {
        questionText:
          'The Q angle is designed as a measurement to determine the amount of lateral force on the patella. Which three bony landmarks are used to measure the Q angle?',
        category: 'Assessment',
        options: [
          'Anterior superior iliac spine, superior border of the patella,tibial tubercle',
          'Anterior superior iliac,midpoint of the patella,tibial tubercle',
          'Anterior superior iliac spine, inferior border of the patella,midpoint of the patella tendon',
          'Greater trochanter, midpoint of the patella,superior border of the patella tendon',
        ],
        correctAnswer: 1,
        explanation:
          'The correct answer is \'Anterior superior iliac,midpoint of the patella,tibial tubercle\'. This is a key concept in physiotherapy practice and clinical assessment.',
        difficulty: 'medium',
        source: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
      },
      {
        questionText:
          'A 55 year old female diagnosed with a right hip intertrochanteric fracture is eight weeks status post open reduction and internal fixation with a plate and pinning. The patient currently has pain on hip flexion and abduction. Acceptable modalities for this patient would include all of the following except?',
        category: 'Treatment Techniques',
        options: [
          'Hot packs',
          'Whirlpool',
          'Pulsed ultrasound',
          'Shortwave diathermy',
        ],
        correctAnswer: 3,
        explanation:
          'The correct answer is \'Shortwave diathermy\'. This is a key concept in physiotherapy practice and clinical assessment.',
        difficulty: 'medium',
        source: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
      },
      {
        questionText:
          'Which of the following is not a realistic goal of a phase II cardiac rehabilitation program?',
        category: 'Clinical Practice',
        options: [
          'To increase exercise capacity and endurance',
          'To teach the patient self monitoring techniques',
          'To assess cardiovascular responses to work',
          'All of the above are realistic goals',
        ],
        correctAnswer: 3,
        explanation:
          'The correct answer is \'All of the above are realistic goals\'. This is a key concept in physiotherapy practice and clinical assessment.',
        difficulty: 'easy',
        source: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
      },
      {
        questionText:
          'Why is a slight anterior pelvic tilt important when positioning a patient in a wheelchair?',
        category: 'Clinical Practice',
        options: [
          'Allows for weight bearing on the ischial tuberosities',
          'Provides flexion in the low back and extension in the hips',
          'Provides a stable base of support for control of the lower extremities',
          'All of the above. 21.when isokinetically testing a patient which standard orthopedic testing procedure is not accurate?',
        ],
        correctAnswer: 0,
        explanation:
          'The correct answer is \'Allows for weight bearing on the ischial tuberosities\'. This is a key concept in physiotherapy practice and clinical assessment.',
        difficulty: 'medium',
        source: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
      },
      {
        questionText:
          'when isokinetically testing a patient which standard orthopedic testing procedure is not accurate?',
        category: 'Assessment',
        options: [
          'The patient must be informed and educated prior to testing',
          'The involved side should be tested first to minimize the effects of muscle fatigue',
          'Verbal commands should be consistent from one test to the next',
          'The patient should perform both submaximal and maximal warm-ups prior',
        ],
        correctAnswer: 1,
        explanation:
          'The correct answer is \'The involved side should be tested first to minimize the effects of muscle fatigue\'. This is a key concept in physiotherapy practice and clinical assessment.',
        difficulty: 'medium',
        source: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
      },
      {
        questionText:
          'when performing goniometric measurements a joint should be placed in the anatomical position. Which joint motions are exceptions to this rule?',
        category: 'Assessment',
        options: [
          'Forearm supination and pronation',
          'Hip rotation',
          'Shoulder rotation',
          'All of the above',
        ],
        correctAnswer: 3,
        explanation:
          'The correct answer is \'All of the above\'. This is a key concept in physiotherapy practice and clinical assessment.',
        difficulty: 'easy',
        source: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
      },
      {
        questionText:
          'an order for chest physical therapy is received for an 82 year old female. The patient recently underwent surgery for a hip fracture and has been taking Coumadin postoperatively. She has a history of multiple compression fractures of thoracic vertebrae. The greatest amount of caution should be taken in the administration?',
        category: 'Treatment Techniques',
        options: [
          'Diaphragmatic breathing exercises',
          'Postural drainage',
          'Therapeutic percussion',
          'Pursed lip breathing',
        ],
        correctAnswer: 2,
        explanation:
          'The correct answer is \'Therapeutic percussion\'. This is a key concept in physiotherapy practice and clinical assessment.',
        difficulty: 'medium',
        source: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
      },
      {
        questionText:
          'which technique would be the most appropriate when assessing the pulse of a patient after exercise?',
        category: 'Assessment',
        options: [
          'Placing the palm of the hand firmly over the pulse site',
          'Counting the pulse for five seconds and multiplying by twelve to determine the beats per minute',
          'Selecting a pulse site that will not cause discomfort and subsequently alter the pulse rate',
          'Selecting three to five separate pulse sites to assure an accurate measurement',
        ],
        correctAnswer: 2,
        explanation:
          'The correct answer is \'Selecting a pulse site that will not cause discomfort and subsequently alter the pulse rate\'. This is a key concept in physiotherapy practice and clinical assessment.',
        difficulty: 'medium',
        source: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
      },
      {
        questionText:
          'When a CVA patient lies on the hemiplegic side all of the following are correct except?',
        category: 'Clinical Practice',
        options: [
          'Spasticity is decreased due to elongation of the affected side',
          'Awareness of the side is increased',
          'The scapula should be in a retracted position',
          'The hemiplegic leg should be extended at the hip and slightly flexed at the knee',
        ],
        correctAnswer: 1,
        explanation:
          'The correct answer is \'Awareness of the side is increased\'. This is a key concept in physiotherapy practice and clinical assessment.',
        difficulty: 'medium',
        source: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
      },
      {
        questionText:
          'while palpating the wrist and hand, it should become apparent that the hamate articulates with the ____metacarpal?',
        category: 'Anatomy',
        options: ['First', 'Second', 'Third', 'Fourth'],
        correctAnswer: 2,
        explanation:
          'The correct answer is \'Third\'. This is a key concept in physiotherapy practice and clinical assessment.',
        difficulty: 'easy',
        source: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
      },
      {
        questionText:
          'A physical therapist evaluates a five year old child\'s gait. The therapist notes the child to be unsteady with a wide base of support. the child appears to lurch at times with minimal truncal bobbing in an anterior and posterior direction. The child can not maintain a standing position with the feet placed together for more than five seconds. The area of the brain most likely affected is the?',
        category: 'Pathology',
        options: [
          'Corticospinal tracts',
          'Basal ganglion',
          'Substantia nigra',
          'Cerebellar hemisphere',
        ],
        correctAnswer: 3,
        explanation:
          'The correct answer is \'Cerebellar hemisphere\'. This is a key concept in physiotherapy practice and clinical assessment.',
        difficulty: 'medium',
        source: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
      },
      {
        questionText:
          'If the axillary nerve was severed, what muscle could laterally rotate the humerus?',
        category: 'Anatomy',
        options: ['Teres major', 'Subscapularis', 'Infraspinatus', 'Trapezius'],
        correctAnswer: 3,
        explanation:
          'The correct answer is \'Trapezius\'. This is a key concept in physiotherapy practice and clinical assessment.',
        difficulty: 'easy',
        source: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
      },
      {
        questionText:
          'A group of graduate physical therapy students design a study to determine the effects of noise level on the ability to perform a physical skill. In their study noise is the?',
        category: 'Clinical Practice',
        options: [
          'Independent variable?',
          'Dependent variable',
          'Criterion variable',
          'Extraneous variable',
        ],
        correctAnswer: 2,
        explanation:
          'The correct answer is \'Criterion variable\'. This is a key concept in physiotherapy practice and clinical assessment.',
        difficulty: 'easy',
        source: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
      },
      {
        questionText:
          'A physical therapist elects to begin joint mobilization by using distraction. Distraction is used for all of the following except?',
        category: 'Treatment Techniques',
        options: [
          'To unweight the joint surfaces',
          'To relieve pressure on an intra \u2013 articular structure',
          'To stretch the joint capsule or adhesions',
          'To determine the nature of resistance at end range',
        ],
        correctAnswer: 0,
        explanation:
          'The correct answer is \'To unweight the joint surfaces\'. This is a key concept in physiotherapy practice and clinical assessment.',
        difficulty: 'medium',
        source: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
      },
      {
        questionText:
          'the single most important factor in an exercise program designed to increase muscular strength is?',
        category: 'Treatment Techniques',
        options: [
          'The recovery time between exercise sets',
          'The number of repetitions per set',
          'The duration of the exercise session',
          'The intensity of the exercise',
        ],
        correctAnswer: 3,
        explanation:
          'The correct answer is \'The intensity of the exercise\'. This is a key concept in physiotherapy practice and clinical assessment.',
        difficulty: 'easy',
        source: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
      },
      {
        questionText:
          'while talking to a patient about their previous exercise program,the patient mentions that he used to exclusively perform negative work. Negative work or a negative a negative muscular contraction is best defined as?',
        category: 'Kinesiology',
        options: [
          'The muscle develops tension and increases in length',
          'The muscle develops tension and decreases in length',
          'Muscle length remains constant as tension is developed',
          'Purposeful voluntary motion',
        ],
        correctAnswer: 3,
        explanation:
          'The correct answer is \'Purposeful voluntary motion\'. This is a key concept in physiotherapy practice and clinical assessment.',
        difficulty: 'medium',
        source: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
      },
      {
        questionText:
          'A 45 year old obese woman in a long leg cast is attempting a sliding board transfer to a mat table, Which of the following instructions would be incurred?',
        category: 'Treatment Techniques',
        options: [
          'Lean away from the mat and place the sliding board under your buttock',
          'Perform a series of small pushups gradually moving closer to the mat',
          'Grasp the edge of the sliding board with your fingers to secure additional support',
          'Maintain a slight forward trunk position while transferring at all times',
        ],
        correctAnswer: 0,
        explanation:
          'The correct answer is \'Lean away from the mat and place the sliding board under your buttock\'. This is a key concept in physiotherapy practice and clinical assessment.',
        difficulty: 'medium',
        source: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
      },
      {
        questionText:
          'A patient three months status post total knee referred to physical therapy for range of motion and strengthening exercises. Which treatment technique would be inappropriate for the patient?',
        category: 'Treatment Techniques',
        options: [
          'Active stretching using the contract \u2013 relax technique',
          'Joint mobilization to increase joint play',
          'Exercise on a stationary bicycle against mild resistance',
          'Performing straight raising, short arc extension, and knee flexion exercises using light weights',
        ],
        correctAnswer: 2,
        explanation:
          'The correct answer is \'Exercise on a stationary bicycle against mild resistance\'. This is a key concept in physiotherapy practice and clinical assessment.',
        difficulty: 'medium',
        source: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
      },
      {
        questionText:
          'A physical therapist is evaluating a 43 year old female who has been diagnosed with a non \u2013 displaced fracture of the greater tuberosity of the humerus. The patient is unsure if she is supposed to keep her arm in the sling given to her by the physician. An appropriate course of action would be to?',
        category: 'Clinical Practice',
        options: [
          'Instruct the patient to wear the sling at all times',
          'Instruct the patient not to use the sling because it will inhibit her range of motion',
          'Use your best judgment based on how the referring physician usually treats humerus fractures',
          'Contact the physician immediately and ask what instructions were given to the patient',
        ],
        correctAnswer: 1,
        explanation:
          'The correct answer is \'Instruct the patient not to use the sling because it will inhibit her range of motion\'. This is a key concept in physiotherapy practice and clinical assessment.',
        difficulty: 'hard',
        source: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
      },
      {
        questionText:
          'the most common site for an ulnar nerve injury is at the?',
        category: 'Anatomy',
        options: [
          'Brachial plexus',
          'Medial epicondyle of the humerus',
          'Superficial surface of the flexor retinaculum',
          'Distal wrist crease',
        ],
        correctAnswer: 3,
        explanation:
          'The correct answer is \'Distal wrist crease\'. This is a key concept in physiotherapy practice and clinical assessment.',
        difficulty: 'easy',
        source: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
      },
      {
        questionText:
          'A 12 year old female became anoxic in a near drowning. The patient can perform dynamic activities in quadruped on a firm mat. The next posture to attain in the developmental sequence is?',
        category: 'Treatment Techniques',
        options: [
          'Half kneeling',
          'Tall kneeling',
          'Plantigrade',
          'Standing',
        ],
        correctAnswer: 1,
        explanation:
          'The correct answer is \'Tall kneeling\'. This is a key concept in physiotherapy practice and clinical assessment.',
        difficulty: 'easy',
        source: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
      },
      {
        questionText:
          'Which type of electrical current would most likely select if your treatment objective is to stimulate denervated muscle?',
        category: 'Treatment Techniques',
        options: [
          'Alternating current',
          'Direct current',
          'Pulsatile current',
          'Denervated muscle responds in a similar manner to all types of current',
        ],
        correctAnswer: 1,
        explanation:
          'The correct answer is \'Direct current\'. This is a key concept in physiotherapy practice and clinical assessment.',
        difficulty: 'easy',
        source: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
      },
      {
        questionText:
          'an 86 year old female is restricted to partial weight bearing on the left leg after a total hip replacement. Her upper extremity strength is 3/5 and she resides alone. Which assistive device would be the most appropriate for this patient?',
        category: 'Clinical Practice',
        options: [
          'Lofstrand crutches',
          'Axillary crutches',
          'Large base quad cane',
          'Two wheel rolling walker',
        ],
        correctAnswer: 1,
        explanation:
          'The correct answer is \'Axillary crutches\'. This is a key concept in physiotherapy practice and clinical assessment.',
        difficulty: 'medium',
        source: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
      },
      {
        questionText:
          'which of the following situations would be contraindicated when using transcutaneous electrical nerve stimulation?',
        category: 'Treatment Techniques',
        options: [
          'Use over an arthritic joint',
          'Use during labor and delivery',
          'Use over a pregnant uterus',
          'Use to diminish phantom limb sensation',
        ],
        correctAnswer: 3,
        explanation:
          'The correct answer is \'Use to diminish phantom limb sensation\'. This is a key concept in physiotherapy practice and clinical assessment.',
        difficulty: 'medium',
        source: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
      },
      {
        questionText:
          'An order is received to perform chest physical therapy on a patient who is status post abdominal surgery. A chart review identifies right atelectasis. During your first session the primary exercise that you will teach the patient is?',
        category: 'Treatment Techniques',
        options: [
          'Reflex cough technique',
          'Codman pendulum exercises',
          'Deep diaphragmatic breathing',
          'Quick paced shallow breathing',
        ],
        correctAnswer: 2,
        explanation:
          'The correct answer is \'Deep diaphragmatic breathing\'. This is a key concept in physiotherapy practice and clinical assessment.',
        difficulty: 'medium',
        source: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
      },
      {
        questionText:
          'The position of a joint that is ideal for palpation is?',
        category: 'Assessment',
        options: [
          'Closed packed',
          'Open packed',
          '90 degrees joint flexion',
          'Joint position does not matter',
        ],
        correctAnswer: 2,
        explanation:
          'The correct answer is \'90 degrees joint flexion\'. This is a key concept in physiotherapy practice and clinical assessment.',
        difficulty: 'easy',
        source: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
      },
      {
        questionText:
          'Preoperative testing is performed prior to cardiac surgery in order to provide additional information on a patient\'s cardiopulmonary status. Which of the following diagnostic tests is of least value in the situation described above?',
        category: 'Assessment',
        options: [
          'Arterial blood gases',
          'Electrocardiogram',
          'Cardiac catheterization',
          'Magnetic resonance imaging',
        ],
        correctAnswer: 1,
        explanation:
          'The correct answer is \'Electrocardiogram\'. This is a key concept in physiotherapy practice and clinical assessment.',
        difficulty: 'hard',
        source: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
      },
      {
        questionText:
          'There are a variety of factors which can significantly influence normal respiration including age,sex,stature and exercise. Which statement describing these is not accurate?',
        category: 'Physiology',
        options: [
          'The respiratory rate of a newborn is between 30 and 60 breaths per minute',
          'Men generally have a larger vital capacity than women',
          'Stout or obese subjects generally have a larger vital capacity than tall,thin individuals',
          'Respiratory rate and depth will increase as a result of increased oxygen consumption and carbon dioxide production',
        ],
        correctAnswer: 3,
        explanation:
          'The correct answer is \'Respiratory rate and depth will increase as a result of increased oxygen consumption and carbon dioxide production\'. This is a key concept in physiotherapy practice and clinical assessment.',
        difficulty: 'medium',
        source: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
      },
      {
        questionText:
          'A physical therapist is treating a neurological patient with a flaccid left side. In order to facilitate muscular activity the treatment plan should include?',
        category: 'Treatment Techniques',
        options: [
          'Weight bearing, tapping, elevation',
          'Vibration, tapping, prolonged stretch',
          'Weight bearing, tapping,approximation',
          'Approximation, elevation,prolonged stretch',
        ],
        correctAnswer: 2,
        explanation:
          'The correct answer is \'Weight bearing, tapping,approximation\'. This is a key concept in physiotherapy practice and clinical assessment.',
        difficulty: 'medium',
        source: 'Palestinian Physiotherapy Licensing Exam 2010-2011',
      },
    ],
  },
];

async function seedExamQuestions() {
  try {
    await connectDB();
    console.log('Connected to MongoDB.');

    const categoryMap = new Map<string, string>();
    const categories = await Category.find({});
    if (categories.length === 0) {
      console.error(
        'No categories found. Please run the main seed script first (npm run seed).'
      );
      process.exit(1);
    }
    for (const cat of categories) {
      categoryMap.set(cat.name, cat._id.toString());
    }
    console.log(
      `Found ${categories.length} categories: ${categories.map((c) => c.name).join(', ')}`
    );

    let totalInserted = 0;
    const categoryCounts: Record<string, number> = {};

    for (const exam of exams) {
      console.log(`\nProcessing exam: ${exam.exam_info.title}`);

      for (const q of exam.questions) {
        const categoryId = categoryMap.get(q.category);
        if (!categoryId) {
          console.warn(
            `  Skipping question - category "${q.category}" not found. Question: "${q.questionText.substring(0, 60)}..."`
          );
          continue;
        }

        await Question.create({
          questionText: q.questionText,
          category: categoryId,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: q.difficulty,
          source: q.source,
          active: true,
        });

        categoryCounts[q.category] = (categoryCounts[q.category] || 0) + 1;
        totalInserted++;
      }
    }

    console.log(`\nInserted ${totalInserted} questions total.`);

    for (const [name, count] of Object.entries(categoryCounts)) {
      const categoryId = categoryMap.get(name);
      if (categoryId) {
        const current = await Category.findById(categoryId);
        if (current) {
          await Category.findByIdAndUpdate(categoryId, {
            questionCount: current.questionCount + count,
          });
          console.log(
            `  Updated "${name}" question count: ${current.questionCount} -> ${current.questionCount + count}`
          );
        }
      }
    }

    console.log('\nExam questions seeded successfully!');
  } catch (error) {
    console.error('Error seeding exam questions:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seedExamQuestions();
