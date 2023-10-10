import { useCallback } from "react";

import Icon from "@reearth/beta/components/Icon";
import PopoverMenuContent from "@reearth/beta/components/PopoverMenuContent";
import AssetCard from "@reearth/beta/features/Assets/AssetCard";
import type {
  AppearanceAddProps,
  AppearanceNameUpdateProps,
} from "@reearth/beta/features/Editor/useAppearances";
import type { NLSAppearance } from "@reearth/services/api/appearanceApi/utils";
import { styled } from "@reearth/services/theme";

type AppearancesProps = {
  appearances: NLSAppearance[];
  selectedAppearanceId?: string;
  onAppearanceAdd: (inp: AppearanceAddProps) => void;
  onAppearanceDelete: (id: string) => void;
  onAppearanceNameUpdate: (inp: AppearanceNameUpdateProps) => void;
  onAppearanceSelect: (id: string) => void;
};

const Appearances: React.FC<AppearancesProps> = ({
  appearances,
  selectedAppearanceId,
  onAppearanceAdd,
  onAppearanceDelete,
  onAppearanceNameUpdate,
  onAppearanceSelect,
}) => {
  const handleAppearanceAddition = useCallback(() => {
    onAppearanceAdd({ name: `Style_${appearances.length + 1}`, value: {} });
  }, [appearances.length, onAppearanceAdd]);

  const handleSelectAppearance = useCallback(
    (appearance?: NLSAppearance) => {
      if (!appearance) return;
      onAppearanceSelect(appearance.id);
    },
    [onAppearanceSelect],
  );

  return (
    <AppearanceContainer>
      <AddAppearanceIcon onClick={handleAppearanceAddition}>
        <Icon icon="addAppearance" />
      </AddAppearanceIcon>

      {appearances.map(appearance => (
        <AssetCard
          id={appearance.id}
          key={appearance.id}
          name={appearance.name}
          icon="appearance"
          onAppearanceNameUpdate={onAppearanceNameUpdate}
          isNameEditable={true}
          selected={appearance.id === selectedAppearanceId}
          actionContent={
            <PopoverMenuContent
              size="sm"
              items={[
                {
                  name: "Delete",
                  icon: "bin",
                  onClick: () => onAppearanceDelete(appearance.id),
                },
              ]}
            />
          }
          onSelect={() => handleSelectAppearance(appearance)}
        />
      ))}
    </AppearanceContainer>
  );
};

const AppearanceContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const AddAppearanceIcon = styled.div`
  align-self: flex-end;
  cursor: pointer;
`;

export default Appearances;
