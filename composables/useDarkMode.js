import { ref, onMounted } from 'vue';

export function useDarkMode() {
  const isDark = ref(true);

  const toggleDarkMode = () => {
    isDark.value = !isDark.value;
    document.documentElement.classList.toggle('dark', isDark.value);
    if (process.client) {
      localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
    }
  };

  onMounted(() => {
    if (process.client) {
      const savedTheme = localStorage.getItem('theme');
      isDark.value = savedTheme === 'dark';
      document.documentElement.classList.toggle('dark', isDark.value);
    }
  });

  return { isDark, toggleDarkMode };
}
