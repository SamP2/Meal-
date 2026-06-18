import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import BottomNavBar from './src/components/BottomNavBar';

// Welcome
import WelcomeScreen from './src/screens/WelcomeScreen';

// Auth (owner only)
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';

// Student (no auth)
import NewStudentHomeScreen from './src/screens/student/NewStudentHomeScreen';
import MessDetailScreen from './src/screens/student/MessDetailScreen';
import MenuScreen from './src/screens/student/MenuScreen';
import MapScreen from './src/screens/student/MapScreen';

// Owner
import SimpleOwnerDashboard from './src/screens/owner/SimpleOwnerDashboard';
import SimpleRegisterMessScreen from './src/screens/owner/SimpleRegisterMessScreen';
import SimpleDailyMenuScreen from './src/screens/owner/SimpleDailyMenuScreen';
import UpdateMenuScreen from './src/screens/owner/UpdateMenuScreen';
import RegisterMessScreen from './src/screens/owner/RegisterMessScreen';
import ManageMessScreen from './src/screens/owner/ManageMessScreen';
import MenuManagementScreen from './src/screens/owner/MenuManagementScreen';
import EverydayMenuScreen from './src/screens/owner/EverydayMenuScreen';
import OwnerAccountScreen from './src/screens/owner/OwnerAccountScreen';

const Stack = createNativeStackNavigator();

// Context to share tab state between OwnerStack and BottomNavBar
const OwnerTabContext = React.createContext<{
  activeTab: string;
  setActiveTab: (tab: string) => void;
  navigation: any;
  setNavigation: (nav: any) => void;
}>({ activeTab: 'Dashboard', setActiveTab: () => {}, navigation: null, setNavigation: () => {} });

// Student stack — no auth, no bottom nav
function StudentStack() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator screenOptions={{
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text,
      headerTitleStyle: { fontWeight: '600' as const },
      headerShadowVisible: false,
    }}>
      <Stack.Screen name="StudentHome" component={NewStudentHomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MapView" component={MapScreen} options={{ title: 'Map View' }} />
      <Stack.Screen name="MessDetail" component={MessDetailScreen} options={{ title: 'Mess Details' }} />
      <Stack.Screen name="Menu" component={MenuScreen} options={{ title: "Today's Menu" }} />
      {/* Owner auth screens - accessible from student home */}
      <Stack.Screen name="OwnerLogin" component={LoginScreen} options={{ title: 'Owner Login', headerShown: true }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Register as Owner' }} />
    </Stack.Navigator>
  );
}

// Owner stack with bottom nav wrapper
function OwnerStackWithNav() {
  const [activeTab, setActiveTab] = React.useState('Dashboard');
  const [navigation, setNavigation] = React.useState<any>(null);

  const handleTabPress = (key: string) => {
    setActiveTab(key);
    if (navigation) {
      navigation.navigate(key === 'Account' ? 'OwnerAccount' : 'Dashboard');
    }
  };

  return (
    <OwnerTabContext.Provider value={{ activeTab, setActiveTab, navigation, setNavigation }}>
      <View style={styles.flex}>
        <View style={styles.flex}>
          <OwnerStack />
        </View>
        <BottomNavBar role="mess_owner" activeTab={activeTab} onTabPress={handleTabPress} />
      </View>
    </OwnerTabContext.Provider>
  );
}

// Owner stack — auth required, with bottom nav
function OwnerStack() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' as const },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="Dashboard"          component={DashboardWithNavCapture}  options={{ headerShown: false }} />
      <Stack.Screen name="OwnerAccount"       component={OwnerAccountScreen}       options={{ headerShown: false }} />
      <Stack.Screen name="SimpleRegisterMess" component={SimpleRegisterMessScreen} options={{ title: 'Register Mess' }} />
      <Stack.Screen name="UpdateMenu"         component={UpdateMenuScreen}         options={{ title: 'Update Menu' }} />
      <Stack.Screen name="SimpleDailyMenu"    component={SimpleDailyMenuScreen}    options={{ title: 'Daily Menu' }} />
      <Stack.Screen name="EverydayMenu"       component={EverydayMenuScreen}       options={{ title: 'Everyday Menu' }} />
      <Stack.Screen name="RegisterMess"       component={RegisterMessScreen}       options={{ title: 'Register Mess (Advanced)' }} />
      <Stack.Screen name="ManageMess"         component={ManageMessScreen}         options={{ title: 'Manage Mess' }} />
      <Stack.Screen name="MenuManagement"     component={MenuManagementScreen}     options={{ title: 'Menu Management' }} />
    </Stack.Navigator>
  );
}

// Captures navigation from Dashboard and registers it in context
function DashboardWithNavCapture(props: any) {
  const { setNavigation } = React.useContext(OwnerTabContext);
  React.useEffect(() => {
    setNavigation(props.navigation);
  }, [props.navigation]);
  return <SimpleOwnerDashboard {...props} />;
}

function AppNavigator() {
  const { isLoading } = useAuth();
  const { colors, isDark } = useTheme();

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme : DefaultTheme).colors,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };

  // Show welcome screen while loading
  if (isLoading) {
    return (
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  // Single welcome screen → student flow (owner login accessible from student home)
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="StudentStack" component={StudentStack} />
        <Stack.Screen name="OwnerStack" component={OwnerStackWithNav} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function AppInner() {
  const { colors } = useTheme();
  return (
    <>
      <StatusBar style={colors.statusBar} />
      <AppNavigator />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
