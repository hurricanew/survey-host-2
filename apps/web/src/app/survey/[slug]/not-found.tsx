'use client'

import { Box, Container, VStack, Text, Button } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { FiHome } from 'react-icons/fi'

export default function SurveyNotFound() {
  const router = useRouter()

  return (
    <Box minH="100vh" bg="#F7FAFC" display="flex" alignItems="center" justifyContent="center">
      <Container maxW="md">
        <VStack gap={6} textAlign="center">
          <Text fontSize="48px">📋</Text>
          <Text fontSize="24px" fontWeight="bold" color="#2B6CB0">
            Survey Not Found
          </Text>
          <Text fontSize="16px" color="#4A5568">
            The survey you&apos;re looking for doesn&apos;t exist or may have been removed.
          </Text>
          <Button
            onClick={() => router.push('/')}
            bg="#2B6CB0"
            color="white"
            size="lg"
            _hover={{ bg: "#2556A3" }}
          >
            <FiHome /> Go Home
          </Button>
        </VStack>
      </Container>
    </Box>
  )
}