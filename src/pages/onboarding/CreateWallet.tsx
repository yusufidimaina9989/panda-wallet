import styled from "styled-components";
import { colors } from "../../colors";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSnackbar } from "../../hooks/useSnackbar";
import { BackButton } from "../../components/BackButton";
import { Text, HeaderText } from "../../components/Reusable";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { PandaHead } from "../../components/PandaHead";
import { useKeys } from "../../hooks/useKeys";
import { useBottomMenu } from "../../hooks/useBottomMenu";
import { PageLoader } from "../../components/PageLoader";
import { Show } from "../../components/Show";
import { sleep } from "../../utils/sleep";

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin: 0;
  padding: 0;
  border: none;
  background: none;
`;

const SeedContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 75%;
  margin: 0.5rem 0;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
`;

const SeedPill = styled.div`
  display: flex;
  align-items: center;
  background-color: ${colors.darkNavy};
  padding: 0.1rem 0 0.1rem 1rem;
  border-radius: 1rem;
  color: ${colors.white};
  font-size: 0.85rem;
  margin: 0.25rem;
  width: 6rem;
`;

export const CreateWallet = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [step, setStep] = useState(1);
  const [seedWords, setSeedWords] = useState<string[]>([]);

  const { addSnackbar } = useSnackbar();
  const { generateSeedAndStoreEncrypted } = useKeys();
  const { hideMenu, showMenu } = useBottomMenu();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    hideMenu();

    return () => {
      showMenu();
    };
  }, [hideMenu, showMenu]);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(seedWords.join(" ")).then(() => {
      addSnackbar("Copied!", "success");
    });
  };

  const handleKeyGeneration = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setLoading(true);
    if (password.length < 8) {
      setLoading(false);
      addSnackbar("The password must be at least 8 characters!", "error");
      return;
    }

    if (password !== passwordConfirm) {
      setLoading(false);
      addSnackbar("The passwords do not match!", "error");
      return;
    }

    // Some artificial delay for the loader
    await sleep(50);
    const mnemonic = generateSeedAndStoreEncrypted(password);
    setSeedWords(mnemonic.split(" "));

    setLoading(false);
    setStep(2);
  };

  const passwordStep = (
    <>
      <BackButton onClick={() => navigate("/")} />
      <Content>
        <HeaderText>Create a password</HeaderText>
        <Text>This is used to unlock your wallet.</Text>
        <FormContainer onSubmit={handleKeyGeneration}>
          <Input
            placeholder="Password"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            placeholder="Confirm Password"
            type="password"
            onChange={(e) => setPasswordConfirm(e.target.value)}
          />
          <Text style={{ margin: "3rem 0 1rem" }}>
            Make sure you are in a safe place and no one is watching.
          </Text>
          <Button type="primary" label="Generate Seed" />
        </FormContainer>
      </Content>
    </>
  );

  const copySeedStep = (
    <>
      <BackButton onClick={() => setStep(1)} />
      <Content>
        <HeaderText>Your recovery phrase</HeaderText>
        <Text style={{ marginBottom: "1rem" }}>
          Safely store your seed phrase. This is the only way you can recover
          your account.
        </Text>
        <SeedContainer>
          <Column>
            {seedWords.slice(0, 6).map((word, index) => (
              <SeedPill key={index}>
                {index + 1}. {word}
              </SeedPill>
            ))}
          </Column>
          <Column>
            {seedWords.slice(6).map((word, index) => (
              <SeedPill key={index + 6}>
                {index + 7}. {word}
              </SeedPill>
            ))}
          </Column>
        </SeedContainer>
        <Button
          type="secondary"
          label="Copy to clipboard"
          onClick={handleCopyToClipboard}
        />
        <Button
          type="primary"
          label="Next"
          onClick={() => {
            setStep(3);
            setSeedWords([]);
          }}
        />
      </Content>
    </>
  );

  const successStep = (
    <>
      <Content>
        <PandaHead />
        <HeaderText>Success!</HeaderText>
        <Text style={{ marginBottom: "1rem" }}>
          Your Panda Wallet is ready to go.
        </Text>
        <Button
          type="primary"
          label="Enter"
          onClick={() => navigate("/bsv-wallet")}
        />
      </Content>
    </>
  );

  return (
    <>
      <Show when={loading}>
        <PageLoader message="Generating keys..." />
      </Show>
      <Show when={!loading && step === 1}>{passwordStep}</Show>
      <Show when={!loading && step === 2}>{copySeedStep}</Show>
      <Show when={!loading && step === 3}>{successStep}</Show>
    </>
  );
};
