import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import Signup from '../Screen/Signup';
import Signupdetail from '../Screen/Signupdetail';
import LoginDetail from '../Screen/Logindetail';
import Diversionscreen from '../Screen/Diversionscreen';
import TabNavigation from './TabNavigation';
import Qbanksubject from '../Screen/Qbanksubject';
import Subjectdetail from '../Screen/Subjectdetail';
import Topicwise from '../Screen/Topicwise';
import Chapterwise from '../Screen/Chapterwise';
import Fornixqbank1 from '../Screen/Fornixqbank1';
import Fornixqbank2 from '../Screen/Fornixqbank2';
import Mood from '../Screen/Mood';
import QuizMain from '../Screen/Quizmain';
import Quizpage from '../Screen/Quizpage';
import Topiclist from '../Screen/Topiclist';
import Home from '../Screen/Home';
import Editprofile from '../Screen/Editprofile';
import Selected from '../Screen/Selected';
import CourseSunscription from '../Screen/CourseSunscription';
import Course from '../Screen/Course';
import Review from '../Screen/Review';
import Successful from '../Screen/Successful';
import Results from '../Screen/Results';
import History from '../Screen/History'
import CheckAttempted from '../Screen/CheckAttempted';




const Stack = createNativeStackNavigator();

function RootNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Signup"
          component={Signup}
          options={{headerShown: false}}
        />
         <Stack.Screen
          name="Signupdetail"
          component={Signupdetail}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Logindetail"
          component={LoginDetail}
          options={{headerShown: false}}
        />
          <Stack.Screen
          name="Diversionscreen"
          component={Diversionscreen}
          options={{headerShown: false}}
        />
         <Stack.Screen
          name="TabNavigation"
          component={TabNavigation}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Qbanksubject"
          component={Qbanksubject}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Subjectdetail"
          component={Subjectdetail}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Topicwise"
          component={Topicwise}
          options={{headerShown: false}}
        />
       <Stack.Screen
          name="Chapterwise"
          component={Chapterwise}
          options={{headerShown: false}}
        />
         <Stack.Screen
          name="Fornixqbank1"
          component={Fornixqbank1}
          options={{headerShown: false}}
        />
         <Stack.Screen
          name="Fornixqbank2"
          component={Fornixqbank2}
          options={{headerShown: false}}
        />
         <Stack.Screen
          name="Mood"
          component={Mood}
          options={{headerShown: false}}
        />
         <Stack.Screen
          name="Quizmain"
          component={QuizMain}
          options={{headerShown: false}}
        />
         <Stack.Screen
          name="Quizpage"
          component={Quizpage}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Topiclist"
          component={Topiclist}
          options={{headerShown: false}}
        />
          <Stack.Screen
          name="Home"
          component={Home}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Editprofile"
          component={Editprofile}
          options={{headerShown: false}}
        />
         <Stack.Screen
          name="Selected"
          component={Selected}
          options={{headerShown: false}}
        />
        <Stack.Screen
        name='Course'
        component={Course}
        options={{headerShown:false}}/>
        <Stack.Screen 
        name='Review'
        component={Review}
        options={{headerShown:false}}
        />
         <Stack.Screen 
        name='Successful'
        component={Successful}
        options={{headerShown:false}}
        />
         <Stack.Screen 
        name='Results'
        component={Results}
        options={{headerShown:false}}
        />
        <Stack.Screen 
        name='History'
        component={History}
        options={{headerShown:false}}
        />
        <Stack.Screen 
        name='CheckAttempted'
        component={CheckAttempted}
        options={{headerShown:false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default RootNavigation;
