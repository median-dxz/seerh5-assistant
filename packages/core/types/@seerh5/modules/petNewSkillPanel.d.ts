declare global {
    namespace petNewSkillPanel {
        class PetNewSkillPanel extends BaseModule {
            _view: NewSkillPanel;
        }
        class NewSkillPanel extends PopView {
            hide(): void;
        }
    }
}

export {};
