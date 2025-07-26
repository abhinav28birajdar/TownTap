import { Box, Button, Center, Heading, Text, View, VStack } from 'native-base';
import React from 'react';
import { SafeAreaView } from 'react-native';
import { COLORS } from '../../config/constants';
import { useAuthStore } from '../../stores/authStore';

const DemoLoginScreen = () => {
  const { loginDemo } = useAuthStore();

  const handleDemoLogin = (userType: 'customer' | 'business_owner') => {
    loginDemo(userType);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <View flex={1} bg={COLORS.white}>
        <Center flex={1} px={6}>
          <VStack space={8} alignItems="center" w="100%">
            {/* App Logo/Title */}
            <VStack space={4} alignItems="center">
              <Text fontSize="6xl">🏪</Text>
              <Heading size="xl" color={COLORS.primary}>
                TownTap
              </Heading>
              <Text fontSize="md" color={COLORS.gray[600]} textAlign="center">
                Smart Business Companion
              </Text>
            </VStack>

            {/* Demo Login Section */}
            <VStack space={6} w="100%">
              <Heading size="md" textAlign="center" color={COLORS.gray[700]}>
                Choose Demo User Type
              </Heading>

              {/* Customer Demo */}
              <Box
                bg={COLORS.blue[50]}
                borderWidth={1}
                borderColor={COLORS.blue[200]}
                borderRadius="lg"
                p={4}
              >
                <VStack space={4} alignItems="center">
                  <Text fontSize="4xl">🛍️</Text>
                  <VStack space={2} alignItems="center">
                    <Heading size="sm" color={COLORS.blue[700]}>
                      Customer Demo
                    </Heading>
                    <Text fontSize="sm" color={COLORS.gray[600]} textAlign="center">
                      Browse businesses, place orders, track deliveries
                    </Text>
                  </VStack>
                  <Button
                    onPress={() => handleDemoLogin('customer')}
                    bg={COLORS.blue[500]}
                    _pressed={{ bg: COLORS.blue[600] }}
                    borderRadius="lg"
                    w="100%"
                  >
                    <Text color="white" fontWeight="semibold">
                      Login as Customer
                    </Text>
                  </Button>
                </VStack>
              </Box>

              {/* Business Demo */}
              <Box
                bg={COLORS.purple[50]}
                borderWidth={1}
                borderColor={COLORS.purple[200]}
                borderRadius="lg"
                p={4}
              >
                <VStack space={4} alignItems="center">
                  <Text fontSize="4xl">💼</Text>
                  <VStack space={2} alignItems="center">
                    <Heading size="sm" color={COLORS.purple[700]}>
                      Business Demo
                    </Heading>
                    <Text fontSize="sm" color={COLORS.gray[600]} textAlign="center">
                      Manage orders, generate content, view analytics
                    </Text>
                  </VStack>
                  <Button
                    onPress={() => handleDemoLogin('business_owner')}
                    bg={COLORS.purple[500]}
                    _pressed={{ bg: COLORS.purple[600] }}
                    borderRadius="lg"
                    w="100%"
                  >
                    <Text color="white" fontWeight="semibold">
                      Login as Business
                    </Text>
                  </Button>
                </VStack>
              </Box>
            </VStack>

            {/* Footer */}
            <VStack space={2} alignItems="center">
              <Text fontSize="xs" color={COLORS.gray[500]} textAlign="center">
                Demo version - No real authentication required
              </Text>
              <Text fontSize="xs" color={COLORS.gray[400]} textAlign="center">
                Switch between user types anytime
              </Text>
            </VStack>
          </VStack>
        </Center>
      </View>
    </SafeAreaView>
  );
};

export default DemoLoginScreen;
