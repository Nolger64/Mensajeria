import React from 'react';
import { Stack } from 'expo-router';
import { useRoleHeaderOptions } from '../../components/RoleNavigation';

export default function Layout() {
  const options = useRoleHeaderOptions();
  return <Stack screenOptions={{ ...options, title: 'Mi agenda' }} />;
}
