import type { Meta, StoryObj } from "@storybook/nextjs";
import { FormField, PasswordConfirmField } from "@/components/auth/FormField";
import { StoryCanvas } from "../../helpers/StoryCanvas";

const meta = {
  title: "UI/Form/FormField",
  component: FormField,
  tags: ["autodocs"],
  args: {
    id: "userid",
    label: "아이디",
    placeholder: "아이디를 입력하세요.",
    value: "dancade",
    requiredIndicator: true,
  },
  decorators: [
    (Story) => (
      <StoryCanvas tone="light" className="w-[560px]">
        <Story />
      </StoryCanvas>
    ),
  ],
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checking: Story = {
  args: {
    label: "닉네임",
    value: "DANA",
    checkStatus: "checking",
  },
};

export const Available: Story = {
  args: {
    label: "닉네임",
    value: "DANA",
    checkStatus: "available",
  },
};

export const Duplicate: Story = {
  args: {
    label: "닉네임",
    value: "DANA",
    checkStatus: "duplicate",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: "locked_user",
  },
};

export const Optional: Story = {
  args: {
    label: "추천인",
    value: "",
    placeholder: "추천인 코드를 입력하세요.",
    requiredIndicator: false,
  },
};

export const Error: Story = {
  args: {
    value: "dan",
    error: "아이디는 최소 4글자 이상이어야 합니다.",
  },
};

export const PasswordConfirm: Story = {
  render: () => (
    <PasswordConfirmField
      id="confirm-password"
      type="password"
      labelLines={["비밀번호", "확인"]}
      value="1234"
      error="비밀번호가 일치하지 않습니다."
      requiredIndicator
    />
  ),
};
