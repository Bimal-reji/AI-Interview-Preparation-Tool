import { Text } from "@jamsr-ui/react";

export const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      <img src="/src/assets/p1.jpg" alt="logo" className="size-10 rounded-full" />
      <Text variant="h5" className="font-normal">
        GetMePlaced
      </Text>
    </div>
  );
};
