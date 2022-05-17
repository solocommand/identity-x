import Controller from '@ember/controller';
import ActionMixin from '@identity-x/manage/mixins/action-mixin';
import AppQueryMixin from '@identity-x/manage/mixins/app-query';
import gql from 'graphql-tag';
import { inject } from '@ember/service';

const mutation = gql`
  mutation AppFieldEdit($input: UpdateSelectFieldMutationInput!) {
    updateSelectField(input: $input) {
      id
      name
      label
      multiple
      required
      active
      externalId {
        id
        namespace { provider tenant type }
        identifier { value }
      }
      options {
        id
        index
        label
        externalIdentifier
        canWriteIn
      }
      groups {
        id
        index
        label
        optionIds
      }
    }
  }
`;

export default Controller.extend(ActionMixin, AppQueryMixin, {
  errorNotifier: inject(),

  actions: {
    async update() {
      try {
        this.startAction();
        const {
          id,
          name,
          label,
          multiple,
          required,
          active,
          options,
          externalId,
          groups,
        } = this.get('model');

        const input = {
          id,
          name,
          label,
          required,
          active,
          externalId: {
            ...(externalId && externalId.namespace && externalId.namespace.type && {
              namespace: {
                provider: externalId.namespace.provider,
                tenant: externalId.namespace.tenant,
                type: externalId.namespace.type,
              },
            }),
            ...(externalId && externalId.identifier && externalId.identifier.value && {
              identifier: { value: externalId.identifier.value },
            }),
          },
          multiple,
          options: options.map((option) => ({
            id: option.id,
            index: option.index,
            label: option.label,
            externalIdentifier: option.externalIdentifier,
            canWriteIn: option.canWriteIn,
          })),
          groups: groups.map((group) => ({
            id: group.id,
            index: group.index,
            label: group.label,
            optionIds: group.optionIds,
          })),
        };
        if (!Object.keys(input.externalId).length) delete input.externalId;
        const variables = { input };
        await this.mutate({ mutation, variables }, 'updateSelectField');
      } catch (e) {
        this.errorNotifier.show(e);
      } finally {
        this.endAction();
      }
    },
  },
});
