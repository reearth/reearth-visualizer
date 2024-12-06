import { Typography } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

type Props = {
  fileOutputs:
    | {
        title: string;
        output: string;
      }[]
    | undefined;
};

const Console: FC<Props> = ({ fileOutputs }) => {
  if (!fileOutputs) return null;
  return (
    <Wrapper>
      {fileOutputs.map(({ title, output }, index) => (
        <Typography key={index} size="body">
          {`[${title}]`} {output || "✔"}
        </Typography>
      ))}
    </Wrapper>
  );
};

const Wrapper = styled.div(() => ({
  display: "flex",
  flexDirection: "column",
  maxHeight: "100%",
  height: "100%",
  overflow: "auto"
}));

export default Console;
