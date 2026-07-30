<template>
  <div class="pp-root" :class="themeClass" :style="rootStyle">
    <!-- Sticky header -->
    <div v-if="content.showHeader !== false" class="pp-header">
      <div class="pp-header__left">
        <h2 class="pp-header__title">{{ dv(content.displayField, ['display']) || content.title || 'Work Order' }}</h2>
        <span v-if="statusText" class="pp-pill" :class="'pp-pill--' + statusKey(statusText)"><span class="pp-pill__dot"></span>{{ statusText }}</span>
      </div>
      <button v-if="content.showOpen !== false" type="button" class="pp-btn pp-btn--ghost pp-open" @click="emitOpenFull">
        <svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('external-link')"></path></svg>
        <span>{{ content.openLabel || 'Open' }}</span>
      </button>
    </div>

    <!-- Vendor Information -->
    <section v-if="content.showVendor !== false" class="pp-card">
      <h3 class="pp-card__title">{{ content.vendorTitle || 'Vendor Information' }}</h3>
      <div class="pp-contact">
        <div class="pp-contact__head">
          <span class="pp-contact__avatar"><svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('user')"></path></svg></span>
          <span class="pp-contact__name">{{ vendorName || 'Unnamed vendor' }}</span>
        </div>
        <a v-if="vendorEmail" class="pp-contact__row pp-contact__row--link" :href="'mailto:' + vendorEmail">
          <svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('mail')"></path></svg><span>{{ vendorEmail }}</span>
        </a>
        <span v-else class="pp-contact__row pp-contact__row--muted"><svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('mail')"></path></svg><span>{{ content.emailEmptyText || 'Email not available' }}</span></span>
        <a v-if="vendorPhone" class="pp-contact__row pp-contact__row--link" :href="'tel:' + vendorPhone">
          <svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('phone')"></path></svg><span>{{ vendorPhone }}</span>
        </a>
        <span v-else class="pp-contact__row pp-contact__row--muted"><svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('phone')"></path></svg><span>{{ content.phoneEmptyText || 'Phone not available' }}</span></span>
        <span v-if="vendorRole" class="pp-contact__row"><svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('briefcase')"></path></svg><span>{{ vendorRole }}</span></span>
      </div>
    </section>

    <!-- Work order details -->
    <section class="pp-card pp-details">
      <div class="pp-grid">
        <!-- WO# (editable) -->
        <div class="pp-field">
          <span class="pp-field__label">{{ content.woLabel || 'WO#' }}</span>
          <template v-if="isEditing('wo')">
            <div class="pp-editrow">
              <input ref="editor" v-model="editValue" class="pp-input" type="text" @keydown.enter.prevent="saveEdit" @keydown.esc="cancelEdit" />
              <button type="button" class="pp-miniic pp-miniic--ok" @click="saveEdit"><svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('check')"></path></svg></button>
              <button type="button" class="pp-miniic" @click="cancelEdit"><svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('x')"></path></svg></button>
            </div>
          </template>
          <div v-else class="pp-field__value pp-field__value--edit">
            <span :class="{ 'pp-muted': isEmpty(val(content.woField, ['external_id_from_project'])) }">{{ val(content.woField, ['external_id_from_project']) || '—' }}</span>
            <button v-if="canEdit" type="button" class="pp-pencil" :title="'Edit ' + (content.woLabel || 'WO#')" @click="startEdit('wo', content.woField || 'external_id_from_project', content.woLabel || 'WO#', false)"><svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('pencil')"></path></svg></button>
          </div>
        </div>

        <!-- Customer -->
        <div class="pp-field">
          <span class="pp-field__label">{{ content.customerLabel || 'Customer' }}</span>
          <span class="pp-field__value" :class="{ 'pp-muted': isEmpty(val(content.customerField, ['customer_name'])) }">{{ val(content.customerField, ['customer_name']) || '—' }}</span>
        </div>

        <!-- Description (editable, full width) -->
        <div class="pp-field pp-field--full">
          <span class="pp-field__label">{{ content.descriptionLabel || 'Description' }}</span>
          <template v-if="isEditing('desc')">
            <div class="pp-editcol">
              <textarea ref="editor" v-model="editValue" class="pp-input pp-input--ta" rows="4" @input="autoGrow" @keydown.esc="cancelEdit"></textarea>
              <div class="pp-editcol__actions">
                <button type="button" class="pp-minibtn pp-minibtn--ok" @click="saveEdit"><svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('check')"></path></svg> Save</button>
                <button type="button" class="pp-minibtn" @click="cancelEdit">Cancel</button>
              </div>
            </div>
          </template>
          <div v-else class="pp-field__value pp-field__value--edit pp-field__value--multiline">
            <span :class="{ 'pp-muted': isEmpty(val(content.descriptionField, ['Notes','Description'])) }">{{ val(content.descriptionField, ['Notes','Description']) || '—' }}</span>
            <button v-if="canEdit" type="button" class="pp-pencil" :title="'Edit ' + (content.descriptionLabel || 'Description')" @click="startEdit('desc', content.descriptionField || 'Notes', content.descriptionLabel || 'Description', true)"><svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('pencil')"></path></svg></button>
          </div>
        </div>

        <!-- Emergency (editable toggle) -->
        <div class="pp-field">
          <span class="pp-field__label">{{ content.emergencyLabel || 'Emergency' }}</span>
          <div class="pp-field__value">
            <button
              type="button"
              class="pp-switch"
              :class="{ 'pp-switch--on': emergencyOn, 'pp-switch--ro': !canEdit }"
              :disabled="!canEdit"
              role="switch"
              :aria-checked="emergencyOn ? 'true' : 'false'"
              @click="toggleEmergency"
            >
              <span class="pp-switch__track"><span class="pp-switch__thumb"></span></span>
              <span class="pp-switch__text" :class="{ 'pp-switch__text--on': emergencyOn }">{{ emergencyOn ? (content.emergencyYes || 'Yes') : (content.emergencyNo || 'No') }}</span>
            </button>
          </div>
        </div>

        <!-- Status -->
        <div class="pp-field">
          <span class="pp-field__label">{{ content.statusLabel || 'Status' }}</span>
          <div class="pp-field__value">
            <span v-if="statusText" class="pp-pill" :class="'pp-pill--' + statusKey(statusText)"><span class="pp-pill__dot"></span>{{ statusText }}</span>
            <span v-else class="pp-muted">—</span>
          </div>
        </div>

        <!-- Location -->
        <div class="pp-field pp-field--full">
          <span class="pp-field__label">{{ content.locationLabel || 'Location' }}</span>
          <span class="pp-field__value" :class="{ 'pp-muted': isEmpty(val(content.locationField, ['address_string'])) }">
            <svg v-if="!isEmpty(val(content.locationField, ['address_string']))" class="pp-svg pp-field__ico" v-bind="svgAttrs"><path :d="ic('pin')"></path></svg>
            {{ val(content.locationField, ['address_string']) || '—' }}
          </span>
        </div>

        <!-- Account Manager -->
        <div class="pp-field">
          <span class="pp-field__label">{{ content.managerLabel || 'Account Manager' }}</span>
          <span class="pp-field__value" :class="{ 'pp-muted': isEmpty(val(content.managerField, ['assigned_to_name'])) }">{{ val(content.managerField, ['assigned_to_name']) || '—' }}</span>
        </div>

        <!-- Portal (editable) -->
        <div class="pp-field">
          <span class="pp-field__label">{{ content.portalLabel || 'Portal' }}</span>
          <template v-if="isEditing('portal')">
            <div class="pp-editrow">
              <input ref="editor" v-model="editValue" class="pp-input" type="text" @keydown.enter.prevent="saveEdit" @keydown.esc="cancelEdit" />
              <button type="button" class="pp-miniic pp-miniic--ok" @click="saveEdit"><svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('check')"></path></svg></button>
              <button type="button" class="pp-miniic" @click="cancelEdit"><svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('x')"></path></svg></button>
            </div>
          </template>
          <div v-else class="pp-field__value pp-field__value--edit">
            <span :class="{ 'pp-muted': isEmpty(val(content.portalField, ['portal_lookup'])) }">{{ val(content.portalField, ['portal_lookup']) || '—' }}</span>
            <button v-if="canEdit" type="button" class="pp-pencil" :title="'Edit ' + (content.portalLabel || 'Portal')" @click="startEdit('portal', content.portalField || 'portal_lookup', content.portalLabel || 'Portal', false)"><svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('pencil')"></path></svg></button>
          </div>
        </div>

        <!-- Tag (single-select dropdown) -->
        <div v-if="content.showTags !== false" class="pp-field pp-field--full">
          <span class="pp-field__label">{{ content.tagsLabel || 'Tag' }}</span>
          <div class="pp-tags">
            <template v-if="canEdit">
              <button type="button" class="pp-tagselect" :class="{ 'pp-tagselect--open': tagsOpen }" @click="toggleTagsOpen">
                <span v-if="selectedTagValue" class="pp-tag">
                  <svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('tag')"></path></svg>{{ tagChipLabel(selectedTagValue) }}
                </span>
                <span v-else class="pp-tagselect__ph">{{ content.tagsPlaceholder || 'Select a tag' }}</span>
                <svg class="pp-svg pp-tags__chev" v-bind="svgAttrs"><path :d="ic('chevron-down')"></path></svg>
              </button>
              <div v-if="tagsOpen" class="pp-tags__panel">
                <input v-model="tagQuery" class="pp-input" type="text" :placeholder="content.tagsSearchPlaceholder || 'Search tags'" />
                <ul class="pp-tags__list">
                  <li v-if="selectedTagValue" class="pp-tags__opt pp-tags__opt--clear" @click="clearTag">
                    <svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('x')"></path></svg><span>Clear tag</span>
                  </li>
                  <li v-if="!filteredTagOptions.length" class="pp-tags__empty">No tags</li>
                  <li v-for="opt in filteredTagOptions" :key="opt.value" class="pp-tags__opt" :class="{ 'pp-tags__opt--sel': isTagSelected(opt) }" @click="chooseTag(opt)">
                    <span class="pp-radio" :class="{ 'pp-radio--on': isTagSelected(opt) }"></span>
                    <span>{{ opt.label }}</span>
                  </li>
                </ul>
              </div>
            </template>
            <template v-else>
              <span v-if="selectedTagValue" class="pp-tag"><svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('tag')"></path></svg>{{ tagChipLabel(selectedTagValue) }}</span>
              <span v-else class="pp-muted">—</span>
            </template>
          </div>
        </div>
      </div>
    </section>

    <!-- Tenant Information -->
    <section v-if="content.showTenant !== false" class="pp-card">
      <h3 class="pp-card__title">{{ content.tenantTitle || 'Tenant Information' }}</h3>
      <div v-if="!hasTenant" class="pp-emptybox">
        <svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('user')"></path></svg>
        <span>{{ content.tenantEmptyText || 'No tenant records for this work order' }}</span>
      </div>
      <div v-else class="pp-contact">
        <div class="pp-contact__head">
          <span class="pp-contact__avatar"><svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('user')"></path></svg></span>
          <span class="pp-contact__name">{{ tenantName || 'Unnamed contact' }}</span>
        </div>
        <a v-if="tenantEmail" class="pp-contact__row pp-contact__row--link" :href="'mailto:' + tenantEmail">
          <svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('mail')"></path></svg><span>{{ tenantEmail }}</span>
        </a>
        <span v-else class="pp-contact__row pp-contact__row--muted"><svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('mail')"></path></svg><span>{{ content.emailEmptyText || 'Email not available' }}</span></span>
        <a v-if="tenantPhone" class="pp-contact__row pp-contact__row--link" :href="'tel:' + tenantPhone">
          <svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('phone')"></path></svg><span>{{ tenantPhone }}</span>
        </a>
        <span v-else class="pp-contact__row pp-contact__row--muted"><svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('phone')"></path></svg><span>{{ content.phoneEmptyText || 'Phone not available' }}</span></span>
      </div>
    </section>

    <!-- Activity feed -->
    <section v-if="content.showActivity !== false" class="pp-card">
      <div class="pp-card__bar">
        <h3 class="pp-card__title pp-card__title--flush">
          <svg class="pp-svg pp-card__ico" v-bind="svgAttrs"><path :d="ic('rss')"></path></svg>
          {{ content.activityTitle || 'Activity' }}
        </h3>
      </div>

      <!-- composer -->
      <div v-if="content.showComposer !== false" class="pp-composer" :class="{ 'pp-composer--active': composerActive }">
        <span class="pp-composer__avatar">
          <img v-if="currentAvatar" :src="currentAvatar" :alt="content.currentUserName || 'You'" />
          <template v-else>{{ initials(content.currentUserName) || 'You' }}</template>
        </span>
        <div class="pp-composer__main">
          <div class="pp-composer__inputwrap">
            <div
              ref="composer"
              class="pp-composer__input"
              contenteditable="true"
              role="textbox"
              :data-placeholder="content.composerPlaceholder || 'Write a note…  type @ to mention someone'"
              @input="onComposerInput"
              @keydown="onComposerKeydown"
              @keyup="onComposerKeyup"
              @click="detectMention"
              @focus="onComposerFocus"
              @paste="onPaste"
            ></div>

            <!-- @mention menu -->
            <div v-if="mentionOpen" class="pp-mentionmenu">
              <button
                v-for="(u, mi) in filteredMentionUsers" :key="u.id != null && u.id !== '' ? u.id : mi" type="button"
                class="pp-mentionitem" :class="{ 'pp-mentionitem--active': mi === mentionIndex }"
                @mousedown.prevent="insertMention(u)" @mouseenter="mentionIndex = mi"
              >
                <span class="pp-mentionitem__avatar">
                  <img v-if="u.avatar" :src="u.avatar" :alt="u.name" />
                  <template v-else>{{ initials(u.name) }}</template>
                </span>
                <span class="pp-mentionitem__name">{{ u.name }}</span>
                <span v-if="u.subtitle" class="pp-mentionitem__sub">{{ u.subtitle }}</span>
              </button>
              <div v-if="!filteredMentionUsers.length" class="pp-mentionmenu__empty">No people found</div>
            </div>
          </div>

          <!-- expanded footer: attachments + actions -->
          <div v-if="composerActive" class="pp-composer__foot">
            <div
              v-if="content.allowAttachments !== false"
              class="pp-drop" :class="{ 'pp-drop--over': dragActive }"
              @dragover.prevent="dragActive = true" @dragleave.prevent="dragActive = false" @drop.prevent="onDrop"
              @click="triggerFile"
            >
              <svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('file-plus')"></path></svg>
              <span>{{ content.attachHint || 'Drop your attachment here or click to browse' }}</span>
              <input ref="file" type="file" multiple class="pp-drop__input" @change="onFileInput" />
            </div>

            <div v-if="attachments.length" class="pp-attpreview">
              <div v-for="(a, ai) in attachments" :key="ai" class="pp-attchip" :class="a.isImage ? 'pp-attchip--img' : 'pp-attchip--file'">
                <img v-if="a.isImage && a.url" :src="a.url" :alt="a.name" />
                <template v-else>
                  <svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('file')"></path></svg>
                  <span class="pp-attchip__name">{{ a.name }}</span>
                </template>
                <button type="button" class="pp-attchip__x" @click.stop="removeAttachment(ai)" aria-label="Remove attachment">
                  <svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('x')"></path></svg>
                </button>
              </div>
            </div>

            <div class="pp-composer__actions">
              <button v-if="content.allowAttachments !== false" type="button" class="pp-composer__tool" @click="triggerFile" title="Attach a file">
                <svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('paperclip')"></path></svg>
              </button>
              <div class="pp-composer__spacer"></div>
              <button type="button" class="pp-btn pp-btn--ghost" @click="cancelComposer">Cancel</button>
              <button type="button" class="pp-btn pp-btn--primary" :disabled="composerEmpty && !attachments.length" @click="submitNote">
                <svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('send')"></path></svg> {{ content.submitLabel || 'Post Note' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ul v-if="activityItems.length" class="pp-feed">
        <li v-for="(f, i) in pagedActivity" :key="actPageOffset + i" class="pp-feeditem" :class="{ 'pp-feeditem--last': i === pagedActivity.length - 1 }">
          <span class="pp-feeditem__avatar">
            <img v-if="avatarUrl(f)" :src="avatarUrl(f)" :alt="authorName(f)" />
            <template v-else>{{ initials(authorName(f)) }}</template>
          </span>
          <div class="pp-feeditem__body">
            <div class="pp-feeditem__head">
              <strong>{{ authorName(f) || 'Unknown' }}</strong>
              <span v-if="actLabel(f)" class="pp-feeditem__activity">{{ actLabel(f) }}</span>
              <span class="pp-muted">{{ timeText(f) }}</span>
            </div>
            <template v-if="bodyText(f)">
              <div v-if="content.activityHtml !== false" class="pp-feeditem__text" v-html="bodyText(f)"></div>
              <p v-else class="pp-feeditem__text">{{ stripHtml(bodyText(f)) }}</p>
            </template>
            <div v-if="attachmentsOf(f).length" class="pp-atts">
              <button v-for="(att, j) in attachmentsOf(f)" :key="j" type="button" class="pp-att" :class="isImage(att) ? 'pp-att--img' : 'pp-att--file'" :title="attName(att)" @click="emitAtt(att)">
                <template v-if="isImage(att)">
                  <img v-if="attThumb(att)" :src="attThumb(att)" :alt="attName(att)" />
                  <svg v-else class="pp-svg" v-bind="svgAttrs"><path :d="ic('image')"></path></svg>
                </template>
                <template v-else>
                  <svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('file')"></path></svg>
                  <span class="pp-att__name">{{ attName(att) }}</span>
                </template>
              </button>
            </div>
          </div>
        </li>
      </ul>
      <div v-else class="pp-feed__empty">{{ content.activityEmptyText || 'No activity yet' }}</div>

      <div v-if="actPaginationActive" class="pp-pager">
        <button class="pp-pager__btn" type="button" :disabled="actPage <= 1" aria-label="Previous page" @click="goActPage(actPage - 1)">
          <svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('chevron-left')"></path></svg>
        </button>
        <span class="pp-pager__info">Page {{ actPage }} of {{ actTotalPages }}</span>
        <button class="pp-pager__btn" type="button" :disabled="actPage >= actTotalPages" aria-label="Next page" @click="goActPage(actPage + 1)">
          <svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('chevron-right')"></path></svg>
        </button>
      </div>
    </section>

    <!-- Optional footer actions -->
    <div v-if="content.showActions === true" class="pp-actions">
      <button type="button" class="pp-btn pp-btn--ghost" @click="emitAction('secondary')">{{ content.secondaryLabel || 'Cancel' }}</button>
      <button type="button" class="pp-btn pp-btn--primary" @click="emitAction('primary')">{{ content.primaryLabel || 'Schedule' }}</button>
    </div>
  </div>
</template>

<script>
const ICONS = {
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  mail: "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6",
  phone: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z",
  briefcase: "M6 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2M4 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zM2 12h20",
  "chevron-down": "M6 9l6 6 6-6",
  tag: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01",
  "external-link": "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3",
  pencil: "M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z",
  check: "M20 6L9 17l-5-5",
  x: "M18 6L6 18M6 6l12 12",
  pin: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  rss: "M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16M5 19a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
  plus: "M12 5v14M5 12h14",
  image: "M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5zM8.5 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 15l-5-5L5 21",
  paperclip: "M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48",
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  "file-plus": "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M12 18v-6M9 15h6",
  file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6",
  "chevron-left": "M15 18l-6-6 6-6",
  "chevron-right": "M9 18l6-6-6-6",
};

export default {
  props: { content: { type: Object, required: true }, uid: { type: String, required: false } },
  emits: ["trigger-event"],
  data() {
    return {
      localEdits: {}, editingKey: null, editField: null, editLabel: null, editValue: "", actPage: 1,
      tagsOpen: false, tagQuery: "",
      // ---- composer ----
      composerOpen: false,
      composerEmpty: true,
      mentionCount: 0,
      mentionOpen: false,
      mentionQuery: "",
      mentionIndex: 0,
      mentionRange: null,
      attachments: [],
      dragActive: false,
    };
  },
  watch: {
    workOrder() { this.localEdits = {}; this.editingKey = null; this.tagsOpen = false; },
    activityCount(n) {
      const tp = Math.max(1, Math.ceil(n / this.actPageSize));
      if (this.actPage > tp) this.actPage = tp;
    },
  },
  beforeUnmount() { this.attachments.forEach((a) => { if (a.url) try { URL.revokeObjectURL(a.url); } catch (e) {} }); },
  computed: {
    canEdit() { return this.content.editable !== false; },
    workOrder() {
      let src = this.content.workOrder;
      if (Array.isArray(src)) return src[0] || {};
      if (src && typeof src === "object") {
        if (Array.isArray(src.data)) return src.data[0] || {};
        return src;
      }
      return {};
    },
    statusText() { return this.val(this.content.statusField, ["Status", "status"]); },
    vendorName() {
      return this.str(this.content.vendorName) || this.val(this.content.vendorNameField, ["work_order_assignee_name"]);
    },
    vendorEmail() { return this.str(this.content.vendorEmail); },
    vendorPhone() { return this.str(this.content.vendorPhone); },
    vendorRole() { return this.str(this.content.vendorRole); },
    // Resolve tenant records. A WeWeb collection object ({ data: [...] }) is
    // always read via its data array (never its own `name`/metadata), so an
    // EMPTY collection yields no record instead of leaking the collection name.
    tenantRecords() {
      const src = this.content.tenant;
      if (Array.isArray(src)) return src;
      if (src && typeof src === "object") {
        if (Array.isArray(src.data)) return src.data;
        return [src];
      }
      return [];
    },
    tenantObj() { return this.tenantRecords[0] || {}; },
    tenantName() {
      return this.str(this.content.tenantName) || this.fromObj(this.tenantObj, this.content.tenantNameField, ["name", "Name", "full_name", "display"]);
    },
    tenantEmail() {
      return this.str(this.content.tenantEmail) || this.fromObj(this.tenantObj, this.content.tenantEmailField, ["email", "Email", "email_address"]);
    },
    tenantPhone() {
      return this.str(this.content.tenantPhone) || this.fromObj(this.tenantObj, this.content.tenantPhoneField, ["phone", "Phone", "phone_number", "mobile"]);
    },
    hasTenant() {
      if (this.str(this.content.tenantName) || this.str(this.content.tenantEmail) || this.str(this.content.tenantPhone)) return true;
      if (!this.tenantRecords.length) return false;
      return !!(this.tenantName || this.tenantEmail || this.tenantPhone);
    },
    // ---- tags dropdown ----
    tagOptions() {
      const src = this.content.tagOptions;
      const arr = Array.isArray(src) ? src : (src && typeof src === "object" && Array.isArray(src.data) ? src.data : []);
      const lk = this.content.tagOptionLabel || "label";
      const vk = this.content.tagOptionValue || "airtable_id";
      const out = arr.map((o) => {
        if (o && typeof o === "object") {
          const value = o[vk] != null ? o[vk] : (o.id != null ? o.id : o.value);
          const label = o[lk] != null ? o[lk] : (o.label || o.name || o.title || value);
          return { value: this.str(value), label: this.normVal(label), sort: Number(o.sort_order), active: o.is_active };
        }
        return { value: this.str(o), label: String(o), sort: NaN, active: true };
      }).filter((o) => o.value !== "" && !(o.active === false || /^(false|no|0)$/i.test(String(o.active))));
      out.sort((a, b) => (isFinite(a.sort) && isFinite(b.sort) ? a.sort - b.sort : String(a.label).localeCompare(String(b.label))));
      return out;
    },
    tagsFieldKey() { return this.content.tagsField || "tag_name"; },
    rawTag() {
      const v = this.workOrder[this.tagsFieldKey];
      const first = Array.isArray(v) ? (v.length ? v[0] : "") : v;
      return first == null ? "" : first;
    },
    // A single selected tag value. Matches the WO field entry to an option by
    // value OR label (works whether the field stores an id or a name).
    selectedTagValue() {
      if (Object.prototype.hasOwnProperty.call(this.localEdits, this.tagsFieldKey)) return this.localEdits[this.tagsFieldKey];
      const s = String(this.rawTag);
      if (s === "") return "";
      const opt = this.tagOptions.find((o) => String(o.value) === s || String(o.label) === s);
      return opt ? opt.value : s;
    },
    filteredTagOptions() {
      const q = String(this.tagQuery || "").trim().toLowerCase();
      if (!q) return this.tagOptions;
      return this.tagOptions.filter((o) => String(o.label).toLowerCase().indexOf(q) !== -1);
    },
    emergencyOn() {
      const key = this.content.emergencyField || "emergency";
      if (Object.prototype.hasOwnProperty.call(this.localEdits, key)) return !!this.localEdits[key];
      return this.truthy(this.unwrap(this.workOrder[key]));
    },
    // ---- activity (mirrors pp-tracker-viewer) ----
    activityItems() {
      let raw = this.content.activity;
      if (Array.isArray(raw)) return raw;
      if (raw && typeof raw === "object" && Array.isArray(raw.data)) return raw.data;
      return [];
    },
    activityCount() { return this.activityItems.length; },
    actPageSize() { const n = Number(this.content.activityPageSize); return n > 0 ? Math.floor(n) : 5; },
    actTotalPages() { return Math.max(1, Math.ceil(this.activityCount / this.actPageSize)); },
    actPaginationActive() { return this.content.paginateActivity !== false && this.actTotalPages > 1; },
    actPageOffset() { return this.content.paginateActivity !== false ? (this.actPage - 1) * this.actPageSize : 0; },
    pagedActivity() {
      if (this.content.paginateActivity === false) return this.activityItems;
      return this.activityItems.slice(this.actPageOffset, this.actPageOffset + this.actPageSize);
    },
    // ---- composer ----
    currentAvatar() { return this.imgUrl(this.content.currentUserAvatar); },
    composerActive() { return this.composerOpen || !this.composerEmpty || this.attachments.length > 0; },
    // Mention source — accepts an array or a WeWeb collection ({ data: [...] }),
    // with configurable field names so it maps any user table.
    mentionUsers() {
      let u = this.content.users;
      if (u && !Array.isArray(u) && Array.isArray(u.data)) u = u.data;
      if (!Array.isArray(u)) return [];
      const lf = this.content.userLabelField || "name";
      const vf = this.content.userValueField || "user_auth_id";
      const af = this.content.userAvatarField || "headshot";
      const sf = this.content.userSubtitleField || "";
      return u.map((o) => {
        if (o && typeof o === "object") {
          const id = o[vf] != null && o[vf] !== "" ? o[vf]
            : (o.user_auth_id != null && o.user_auth_id !== "" ? o.user_auth_id
              : (o.id != null && o.id !== "" ? o.id : (o.airtable_record_id || o.airtable_id)));
          const name = String(o[lf] != null ? o[lf] : (o.name || o.label || o.title || ""));
          return { id, name, avatar: this.imgUrl(o[af]), subtitle: sf ? String(o[sf] || "") : "", raw: o };
        }
        return { id: o, name: String(o), avatar: "", subtitle: "" };
      }).filter((x) => x.name);
    },
    filteredMentionUsers() {
      const q = String(this.mentionQuery || "").toLowerCase();
      const list = this.mentionUsers;
      if (!q) return list.slice(0, 8);
      return list.filter((u) => u.name.toLowerCase().indexOf(q) !== -1 || String(u.subtitle || "").toLowerCase().indexOf(q) !== -1).slice(0, 8);
    },
    svgAttrs() {
      return { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" };
    },
    themeClass() {
      const m = this.content.darkMode || "auto";
      return { "pp-auto": m === "auto", "pp-dark": m === "dark", "pp-light": m === "light" };
    },
    rootStyle() {
      return {
        "--pp-primary": this.content.primaryColor || "#10b981",
        "--pp-accent": this.content.accentColor || "#6366f1",
        "--pp-radius": (this.content.radius != null ? this.content.radius : 16) + "px",
        "--pp-gap": (this.content.sectionGap != null && this.content.sectionGap !== "" ? this.content.sectionGap : 18) + "px",
      };
    },
  },
  methods: {
    ic(name) { return ICONS[name] || ""; },
    str(v) { return v == null ? "" : String(v); },
    isEmpty(v) { return v == null || v === "" || (Array.isArray(v) && !v.length); },
    unwrap(v) { return Array.isArray(v) ? (v.length ? v[0] : "") : v; },
    truthy(v) { return v === true || v === 1 || v === "1" || /^(true|yes|y)$/i.test(String(v == null ? "" : v)); },
    joinArray(arr) {
      return arr.map((x) => (x && typeof x === "object" ? (x.name || x.label || x.title || x.value || "") : x)).filter((v) => v != null && v !== "").join(", ");
    },
    normVal(v) {
      if (Array.isArray(v)) return this.joinArray(v);
      if (v && typeof v === "object") return v.name || v.label || v.title || v.value || "";
      return v == null ? "" : String(v);
    },
    // Value of a WO field (respects an optimistic local edit), by mapped key or fallbacks.
    val(key, fallbacks) {
      const k = key || (fallbacks && fallbacks[0]);
      if (k && Object.prototype.hasOwnProperty.call(this.localEdits, k)) return this.str(this.localEdits[k]);
      let v = this.workOrder[k];
      if (this.isEmpty(v) && fallbacks) {
        for (let i = 0; i < fallbacks.length; i++) { if (!this.isEmpty(this.workOrder[fallbacks[i]])) { v = this.workOrder[fallbacks[i]]; break; } }
      }
      const s = this.normVal(v);
      return /^null$/i.test(s.trim()) ? "" : s.trim();
    },
    dv(key, fallbacks) { return this.val(key, fallbacks); },
    fromObj(obj, key, fallbacks) {
      if (!obj) return "";
      if (key && !this.isEmpty(obj[key])) return this.normVal(obj[key]);
      for (let i = 0; i < (fallbacks || []).length; i++) { if (!this.isEmpty(obj[fallbacks[i]])) return this.normVal(obj[fallbacks[i]]); }
      return "";
    },
    statusKey(status) {
      const s = String(this.normVal(status)).toLowerCase();
      if (/cancel|reject|declin|fail|void|overdue/.test(s)) return "danger";
      if (/unschedul|pending|review|hold|await|draft|new/.test(s)) return "warning";
      if (/complete|done|paid|closed|approved|finished|scheduled|active/.test(s)) return "success";
      if (/progress|open|assigned|dispatch/.test(s)) return "info";
      return "slate";
    },
    // ---- inline editing ----
    isEditing(k) { return this.editingKey === k; },
    startEdit(k, field, label, multiline) {
      if (!this.canEdit) return;
      this.editingKey = k;
      this.editField = field;
      this.editLabel = label;
      this.editValue = this.val(field, null);
      this.$nextTick(() => {
        const el = this.$refs.editor;
        const node = Array.isArray(el) ? el[0] : el;
        if (node) { node.focus(); if (node.select && !multiline) node.select(); if (multiline) this.growNode(node); }
      });
    },
    cancelEdit() { this.editingKey = null; this.editField = null; },
    saveEdit() {
      if (!this.editingKey) return;
      const field = this.editField, label = this.editLabel;
      const prev = this.val(field, null);
      const value = this.editValue;
      this.editingKey = null;
      this.localEdits = Object.assign({}, this.localEdits, { [field]: value });
      this.$emit("trigger-event", { name: "fieldChange", event: { field: label, key: field, previous: prev, value } });
    },
    // ---- tag (single-select, own trigger) ----
    toggleTagsOpen() { this.tagsOpen = !this.tagsOpen; if (this.tagsOpen) this.tagQuery = ""; },
    isTagSelected(opt) { return String(this.selectedTagValue) === String(opt.value); },
    tagChipLabel(v) { const o = this.tagOptions.find((x) => String(x.value) === String(v)); return o ? o.label : String(v); },
    chooseTag(opt) {
      const prev = this.selectedTagValue;
      // Clicking the current tag again clears it; otherwise it replaces.
      const next = String(prev) === String(opt.value) ? "" : opt.value;
      this.tagsOpen = false;
      this.emitTag(prev, next);
    },
    clearTag() {
      const prev = this.selectedTagValue;
      this.tagsOpen = false;
      this.emitTag(prev, "");
    },
    emitTag(prev, next) {
      const field = this.tagsFieldKey;
      this.localEdits = Object.assign({}, this.localEdits, { [field]: next });
      this.$emit("trigger-event", {
        name: "tagChange",
        event: { id: this.workOrder[this.content.idField || "id"] || "", key: field, previous: prev || "", value: next || "", label: next ? this.tagChipLabel(next) : "" },
      });
    },
    toggleEmergency() {
      if (!this.canEdit) return;
      const field = this.content.emergencyField || "emergency";
      const prev = this.emergencyOn;
      const value = !prev;
      this.localEdits = Object.assign({}, this.localEdits, { [field]: value });
      this.$emit("trigger-event", { name: "fieldChange", event: { field: this.content.emergencyLabel || "Emergency", key: field, previous: prev, value } });
    },
    growNode(node) { if (!node) return; node.style.height = "auto"; node.style.height = Math.min(node.scrollHeight, 480) + "px"; },
    autoGrow(e) { this.growNode(e && e.target ? e.target : e); },
    // ---- activity helpers (mirror pp-tracker-viewer) ----
    authorName(f) { if (!f) return ""; return f.author || (f.user_id && f.user_id.name) || (f.user && f.user.name) || f.name || ""; },
    avatarUrl(f) { if (!f) return ""; return f.avatar || (f.user_id && f.user_id.headshot) || (f.user && f.user.headshot) || f.headshot || ""; },
    timeText(f) {
      if (!f) return "";
      if (f.time) return f.time;
      const raw = f.created_at || f.createdAt || f.date;
      if (!raw) return "";
      const d = new Date(raw);
      if (isNaN(d)) return String(raw);
      return d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
    },
    actLabel(f) { return (f && (f.activity || f.action)) || ""; },
    bodyText(f) { return (f && (f.text || f.description)) || ""; },
    stripHtml(s) { return String(s == null ? "" : s).replace(/<[^>]*>/g, "").trim(); },
    initials(name) { return (name || "").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase(); },
    attachmentsOf(f) { return f && Array.isArray(f.attachments) ? f.attachments : []; },
    isImage(att) {
      if (!att) return false;
      const ct = (att.content_type || att.contentType || att.type || "").toLowerCase();
      if (ct) return ct.indexOf("image/") === 0;
      const u = (att.url || att || "").toString().toLowerCase();
      return /\.(png|jpe?g|gif|webp|svg|bmp)(\?|$)/.test(u);
    },
    thumbUrl(obj) {
      if (!obj) return "";
      if (typeof obj === "string") return obj;
      const t = obj.thumbnails;
      if (t && typeof t === "object") {
        for (const k of ["small", "large", "full"]) { if (t[k] && t[k].url) return t[k].url; }
      }
      return obj.thumbnail_url || obj.thumbnailUrl || obj.thumbnail || obj.url || obj.src || obj.image || "";
    },
    attThumb(att) { return this.thumbUrl(att); },
    attName(att) {
      if (!att) return "File";
      if (att.name || att.filename) return att.name || att.filename;
      const u = (att.url || "").toString().split("?")[0];
      return u.substring(u.lastIndexOf("/") + 1) || "File";
    },
    attType(att) { return (att && (att.content_type || att.contentType || att.type)) || ""; },
    // ---- emits ----
    goActPage(p) {
      const next = Math.max(1, Math.min(this.actTotalPages, p));
      if (next === this.actPage) return;
      this.actPage = next;
      this.$emit("trigger-event", { name: "activityPageChange", event: { page: next } });
    },
    imgUrl(v) {
      if (Array.isArray(v)) v = v[0];
      if (v && typeof v === "object") return v.url || v.src || (v.thumbnails && v.thumbnails.small && v.thumbnails.small.url) || "";
      return v || "";
    },
    // ---- composer: focus / state ----
    onComposerFocus() { this.composerOpen = true; },
    onComposerInput() { this.refreshComposerState(); this.detectMention(); },
    onComposerKeyup(e) {
      if (this.mentionOpen && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter")) return;
      this.detectMention();
    },
    refreshComposerState() {
      const el = this.$refs.composer;
      if (!el) return;
      this.mentionCount = el.querySelectorAll(".pp-mention").length;
      this.composerEmpty = el.textContent.replace(/ /g, " ").trim() === "" && this.mentionCount === 0;
    },
    onPaste(e) {
      e.preventDefault();
      const cd = e.clipboardData || window.clipboardData;
      const text = cd && cd.getData ? cd.getData("text/plain") : "";
      if (text) document.execCommand("insertText", false, text);
      this.refreshComposerState();
    },
    onComposerKeydown(e) {
      if (this.mentionOpen && this.filteredMentionUsers.length) {
        if (e.key === "ArrowDown") { e.preventDefault(); this.mentionIndex = Math.min(this.mentionIndex + 1, this.filteredMentionUsers.length - 1); return; }
        if (e.key === "ArrowUp") { e.preventDefault(); this.mentionIndex = Math.max(this.mentionIndex - 1, 0); return; }
        if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); this.insertMention(this.filteredMentionUsers[this.mentionIndex] || this.filteredMentionUsers[0]); return; }
      }
      if (this.mentionOpen && e.key === "Escape") { e.preventDefault(); this.closeMention(); return; }
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); this.submitNote(); }
    },
    // ---- composer: @mention detection + insertion ----
    detectMention() {
      const el = this.$refs.composer;
      const sel = typeof window !== "undefined" ? window.getSelection() : null;
      if (!el || !sel || !sel.rangeCount) { this.closeMention(); return; }
      const range = sel.getRangeAt(0);
      const node = range.startContainer;
      if (node.nodeType !== 3 || !el.contains(node)) { this.closeMention(); return; }
      const before = node.textContent.slice(0, range.startOffset);
      const m = /(^|\s| )@([^\s@ ]*)$/.exec(before);
      if (!m) { this.closeMention(); return; }
      const query = m[2];
      if (query !== this.mentionQuery) this.mentionIndex = 0;
      this.mentionQuery = query;
      this.mentionRange = { node, start: range.startOffset - query.length - 1, end: range.startOffset };
      this.mentionOpen = true;
    },
    closeMention() { this.mentionOpen = false; this.mentionQuery = ""; this.mentionRange = null; },
    insertMention(user) {
      const el = this.$refs.composer;
      if (!el || !this.mentionRange) { this.closeMention(); return; }
      const { node, start, end } = this.mentionRange;
      let range;
      try {
        range = document.createRange();
        range.setStart(node, start);
        range.setEnd(node, end);
        range.deleteContents();
      } catch (e) { this.closeMention(); return; }
      const pill = document.createElement("span");
      pill.className = "pp-mention";
      pill.setAttribute("contenteditable", "false");
      pill.setAttribute("data-id", user.id != null ? String(user.id) : "");
      pill.setAttribute("data-name", user.name);
      pill.textContent = "@" + user.name;
      range.insertNode(pill);
      const space = document.createTextNode(" ");
      if (pill.parentNode) pill.parentNode.insertBefore(space, pill.nextSibling);
      const sel = window.getSelection();
      const after = document.createRange();
      after.setStart(space, 1);
      after.collapse(true);
      sel.removeAllRanges();
      sel.addRange(after);
      el.focus();
      this.closeMention();
      this.refreshComposerState();
    },
    // ---- composer: serialize ----
    serialize() {
      const el = this.$refs.composer;
      const mentions = [];
      const seen = {};
      let text = "";
      const walk = (nodes) => {
        nodes.forEach((n) => {
          if (n.nodeType === 3) { text += n.textContent; return; }
          if (n.nodeType !== 1) return;
          if (n.classList && n.classList.contains("pp-mention")) {
            const id = n.getAttribute("data-id") || "";
            const name = n.getAttribute("data-name") || n.textContent.replace(/^@/, "");
            const key = id || name;
            if (!seen[key]) { seen[key] = true; mentions.push({ id, name }); }
            text += "@" + name;
            return;
          }
          if (n.tagName === "BR") { text += "\n"; return; }
          walk(Array.from(n.childNodes));
          if (/^(DIV|P)$/.test(n.tagName)) text += "\n";
        });
      };
      if (el) walk(Array.from(el.childNodes));
      return { text: text.replace(/ /g, " ").replace(/\n{3,}/g, "\n\n").trim(), mentions, html: el ? el.innerHTML : "" };
    },
    // ---- composer: attachments ----
    triggerFile() { if (this.$refs.file) this.$refs.file.click(); },
    onFileInput(e) { this.addFiles(e.target.files); e.target.value = ""; },
    onDrop(e) { this.dragActive = false; this.addFiles(e.dataTransfer && e.dataTransfer.files); },
    addFiles(fileList) {
      const files = Array.from(fileList || []);
      files.forEach((file) => {
        const isImg = (file.type || "").indexOf("image/") === 0;
        this.attachments.push({ file, name: file.name, size: file.size, type: file.type, isImage: isImg, url: isImg ? URL.createObjectURL(file) : "" });
      });
      this.composerOpen = true;
    },
    removeAttachment(i) {
      const a = this.attachments[i];
      if (a && a.url) try { URL.revokeObjectURL(a.url); } catch (e) {}
      this.attachments.splice(i, 1);
    },
    // ---- composer: submit / cancel ----
    submitNote() {
      const { text, mentions, html } = this.serialize();
      if (!text && !this.attachments.length) return;
      this.$emit("trigger-event", {
        name: "noteSubmit",
        event: {
          id: this.workOrder[this.content.idField || "id"] || "",
          text, html,
          mentions,
          mentionIds: mentions.map((m) => m.id),
          files: this.attachments.map((a) => a.file),
          attachments: this.attachments.map((a) => ({ name: a.name, size: a.size, type: a.type })),
        },
      });
      this.resetComposer();
    },
    cancelComposer() { this.resetComposer(); },
    resetComposer() {
      if (this.$refs.composer) this.$refs.composer.innerHTML = "";
      this.attachments.forEach((a) => { if (a.url) try { URL.revokeObjectURL(a.url); } catch (e) {} });
      this.attachments = [];
      this.mentionCount = 0;
      this.composerEmpty = true;
      this.composerOpen = false;
      this.closeMention();
    },
    emitAtt(att) {
      this.$emit("trigger-event", { name: "attachmentClick", event: { url: (att && att.url) || "", type: this.attType(att), filename: this.attName(att), isImage: this.isImage(att), attachment: att || null } });
    },
    emitOpenFull() {
      this.$emit("trigger-event", { name: "openFull", event: { id: this.workOrder[this.content.idField || "id"] || "", workOrder: this.workOrder } });
    },
    emitAction(which) {
      this.$emit("trigger-event", { name: which === "primary" ? "primaryAction" : "secondaryAction", event: { id: this.workOrder[this.content.idField || "id"] || "", workOrder: this.workOrder } });
    },
  },
};
</script>

<style lang="scss" scoped>
.pp-root {
  --surface: #ffffff; --surface-2: #f7f9fc; --surface-3: #eef2f7; --border: #e4e9f0; --border-strong: #d4dbe6;
  --text: #1f2a37; --text-muted: #64748b; --text-subtle: #94a3b8;
  --shadow: 0 1px 2px rgba(16, 24, 40, 0.04), 0 8px 24px rgba(16, 24, 40, 0.06);
  --shadow-sm: 0 1px 2px rgba(16, 24, 40, 0.06);
  --shadow-pop: 0 12px 32px rgba(16, 24, 40, 0.16);
  --ok: #10b981; --info: #3b82f6; --warn: #f59e0b; --danger: #ef4444;
  --accent: var(--pp-accent, #6366f1); --primary: var(--pp-primary, #10b981); --radius: var(--pp-radius, 16px);
  box-sizing: border-box; width: 100%; max-width: 100%; color: var(--text);
  container-type: inline-size;
  font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.45;
  display: flex; flex-direction: column;
}
/* WeWeb forces the root to display:block (which kills flex gap), so space sections with margins */
.pp-root > .pp-header, .pp-root > .pp-card { margin-bottom: var(--pp-gap, 18px); }
.pp-root > .pp-actions { margin-bottom: 0; }
.pp-root *, .pp-root *::before, .pp-root *::after { box-sizing: border-box; }
@mixin dark {
  --surface: #161f30; --surface-2: #1b2638; --surface-3: #202c40; --border: #28344a; --border-strong: #34425c;
  --text: #e8eef7; --text-muted: #94a3b8; --text-subtle: #64748b;
  --shadow: 0 1px 2px rgba(0, 0, 0, 0.4), 0 12px 28px rgba(0, 0, 0, 0.35);
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-pop: 0 16px 40px rgba(0, 0, 0, 0.5);
}
.pp-root.pp-dark { @include dark; }
@media (prefers-color-scheme: dark) { .pp-root.pp-auto { @include dark; } }

.pp-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow-sm); padding: clamp(18px, 2.4vw, 24px); }
.pp-card__title { margin: 0 0 14px; font-size: 15.5px; font-weight: 700; color: var(--text); }
.pp-card__title--flush { margin: 0; display: flex; align-items: center; gap: 8px; }
.pp-card__ico { width: 17px; height: 17px; color: var(--text-muted); }
.pp-card__bar { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 16px; }

.pp-header {
  position: sticky; top: 0; z-index: 6;
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  background: var(--surface); padding: 12px 2px; border-bottom: 1px solid var(--border);
}
.pp-header__left { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; min-width: 0; }
.pp-header__title { margin: 0; font-size: 18px; font-weight: 800; color: var(--text); overflow: hidden; text-overflow: ellipsis; }
.pp-open { flex: none; }

/* Contact card (vendor / tenant) */
.pp-contact { border: 1px solid var(--border); border-radius: 12px; padding: 16px; background: var(--surface-2); display: flex; flex-direction: column; gap: 11px; }
.pp-contact__head { display: flex; align-items: center; gap: 10px; }
.pp-contact__avatar { flex: none; display: grid; place-items: center; width: 34px; height: 34px; border-radius: 9px; background: color-mix(in srgb, var(--accent) 14%, transparent); color: var(--accent); }
.pp-contact__avatar .pp-svg { width: 19px; height: 19px; }
.pp-contact__name { font-size: 16px; font-weight: 700; color: var(--text); }
.pp-contact__row { display: flex; align-items: center; gap: 9px; font-size: 13.5px; text-decoration: none; }
.pp-contact__row .pp-svg { width: 15px; height: 15px; flex: none; color: var(--accent); }
.pp-contact__row--link { color: var(--info); }
.pp-contact__row--link:hover { text-decoration: underline; }
.pp-contact__row--muted { color: var(--text-subtle); }
.pp-contact__row--muted .pp-svg { color: var(--text-subtle); }

/* Details grid */
.pp-grid { display: grid; grid-template-columns: 1fr; gap: 18px 22px; }
@container (min-width: 480px) { .pp-grid { grid-template-columns: 1fr 1fr; } }
.pp-field { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
.pp-field--full { grid-column: 1 / -1; }
.pp-field__label { font-size: 12px; font-weight: 700; letter-spacing: .03em; text-transform: uppercase; color: var(--text-subtle); }
.pp-field__value { font-size: 14px; color: var(--text); overflow-wrap: anywhere; display: flex; align-items: flex-start; gap: 7px; }
.pp-field__value--multiline { white-space: pre-wrap; }
.pp-field__ico { width: 15px; height: 15px; color: var(--text-subtle); flex: none; margin-top: 2px; }
.pp-field__value--edit { justify-content: space-between; }
.pp-muted { color: var(--text-subtle); }

.pp-pencil { flex: none; display: grid; place-items: center; width: 24px; height: 24px; border-radius: 6px; border: 1px solid transparent; background: transparent; color: var(--text-subtle); cursor: pointer; padding: 0; opacity: 0; transition: opacity .12s, color .15s, border-color .15s, background .15s; }
.pp-field:hover .pp-pencil { opacity: 1; }
.pp-pencil:hover { color: var(--primary); border-color: var(--primary); background: color-mix(in srgb, var(--primary) 8%, transparent); }
.pp-pencil .pp-svg { width: 13px; height: 13px; }

.pp-editrow { display: flex; align-items: center; gap: 6px; }
.pp-editcol { display: flex; flex-direction: column; gap: 8px; }
.pp-editcol__actions { display: flex; gap: 8px; }
.pp-input { flex: 1; min-width: 0; width: 100%; padding: 8px 11px; border: 1px solid var(--border-strong); border-radius: 8px; background: var(--surface); color: var(--text); font-family: inherit; font-size: 14px; outline: none; }
.pp-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 14%, transparent); }
.pp-input--ta { line-height: 1.5; resize: vertical; min-height: 90px; }
.pp-miniic { flex: none; display: grid; place-items: center; width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border-strong); background: var(--surface); color: var(--text-muted); cursor: pointer; }
.pp-miniic:hover { background: var(--surface-3); color: var(--text); }
.pp-miniic .pp-svg { width: 15px; height: 15px; }
.pp-miniic--ok { background: var(--primary); border-color: var(--primary); color: #fff; }
.pp-miniic--ok:hover { background: var(--primary); color: #fff; filter: brightness(1.05); }
.pp-minibtn { display: inline-flex; align-items: center; gap: 5px; padding: 7px 13px; border-radius: 8px; border: 1px solid var(--border-strong); background: var(--surface); color: var(--text-muted); font-family: inherit; font-size: 13px; font-weight: 600; cursor: pointer; }
.pp-minibtn:hover { background: var(--surface-3); color: var(--text); }
.pp-minibtn .pp-svg { width: 14px; height: 14px; }
.pp-minibtn--ok { background: var(--primary); border-color: var(--primary); color: #fff; }
.pp-minibtn--ok:hover { filter: brightness(1.05); }

/* Emergency switch */
.pp-switch { display: inline-flex; align-items: center; gap: 9px; border: none; background: transparent; padding: 0; cursor: pointer; font-family: inherit; }
.pp-switch--ro { cursor: default; }
.pp-switch__track { position: relative; width: 40px; height: 22px; border-radius: 999px; background: var(--surface-3); border: 1px solid var(--border-strong); transition: background .18s, border-color .18s; }
.pp-switch__thumb { position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%; background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,.25); transition: transform .18s; }
.pp-switch--on .pp-switch__track { background: var(--danger); border-color: var(--danger); }
.pp-switch--on .pp-switch__thumb { transform: translateX(18px); }
.pp-switch__text { font-size: 13.5px; font-weight: 600; color: var(--text-muted); }
.pp-switch__text--on { color: var(--danger); }

/* Tenant empty state */
.pp-emptybox { display: flex; align-items: center; gap: 10px; padding: 18px 16px; border: 1px dashed var(--border-strong); border-radius: 12px; background: var(--surface-2); color: var(--text-subtle); font-size: 13.5px; }
.pp-emptybox .pp-svg { width: 20px; height: 20px; flex: none; }

/* Tag single-select */
.pp-tags { display: flex; flex-direction: column; gap: 8px; align-items: flex-start; }
.pp-tag { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 999px; background: color-mix(in srgb, var(--accent) 12%, transparent); color: var(--accent); font-size: 12.5px; font-weight: 600; }
.pp-tag .pp-svg { width: 12px; height: 12px; }
.pp-tagselect { display: inline-flex; align-items: center; gap: 8px; min-width: 200px; max-width: 100%; justify-content: space-between; padding: 7px 11px; border: 1px solid var(--border-strong); border-radius: 10px; background: var(--surface); color: var(--text); font-family: inherit; font-size: 13.5px; cursor: pointer; transition: border-color .15s, box-shadow .15s; }
.pp-tagselect:hover { border-color: var(--primary); }
.pp-tagselect--open { border-color: var(--primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 14%, transparent); }
.pp-tagselect__ph { color: var(--text-subtle); }
.pp-tags__chev { width: 15px; height: 15px; color: var(--text-muted); flex: none; transition: transform .18s; }
.pp-tagselect--open .pp-tags__chev { transform: rotate(180deg); }
.pp-tags__panel { align-self: stretch; border: 1px solid var(--border-strong); border-radius: 12px; padding: 8px; background: var(--surface); box-shadow: var(--shadow-sm); }
.pp-tags__list { list-style: none; margin: 6px 0 0; padding: 0; max-height: 240px; overflow-y: auto; }
.pp-tags__opt { display: flex; align-items: center; gap: 9px; padding: 8px; border-radius: 8px; cursor: pointer; font-size: 13.5px; color: var(--text); transition: background .12s; }
.pp-tags__opt:hover { background: var(--surface-3); }
.pp-tags__opt--sel { color: var(--primary); font-weight: 600; }
.pp-tags__opt--clear { color: var(--text-muted); }
.pp-tags__opt--clear .pp-svg { width: 14px; height: 14px; }
.pp-tags__empty { padding: 12px 8px; color: var(--text-subtle); font-size: 13px; text-align: center; }
.pp-radio { flex: none; width: 16px; height: 16px; border-radius: 50%; border: 1.5px solid var(--border-strong); position: relative; }
.pp-radio--on { border-color: var(--primary); }
.pp-radio--on::after { content: ""; position: absolute; inset: 3px; border-radius: 50%; background: var(--primary); }

/* Pills */
.pp-pill { display: inline-flex; align-items: center; gap: 6px; padding: 4px 11px; border-radius: 999px; font-size: 12px; font-weight: 600; white-space: nowrap; }
.pp-pill__dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.pp-pill--success { background: color-mix(in srgb, var(--ok) 14%, transparent); color: var(--ok); }
.pp-pill--danger { background: color-mix(in srgb, var(--danger) 14%, transparent); color: var(--danger); }
.pp-pill--warning { background: color-mix(in srgb, var(--warn) 16%, transparent); color: color-mix(in srgb, var(--warn) 82%, var(--text)); }
.pp-pill--info { background: color-mix(in srgb, var(--info) 14%, transparent); color: var(--info); }
.pp-pill--slate { background: var(--surface-3); color: var(--text-muted); }

/* Activity feed (mirrors pp-tracker-viewer) */
/* ---- composer (mirrors pp-feed) ---- */
.pp-composer { display: flex; gap: 14px; margin-bottom: 22px; }
.pp-composer__avatar { flex: none; display: grid; place-items: center; width: 40px; height: 40px; border-radius: 50%; overflow: hidden; background: color-mix(in srgb, var(--accent) 16%, transparent); color: var(--accent); font-weight: 700; font-size: 13px; }
.pp-composer__avatar img { width: 100%; height: 100%; object-fit: cover; }
.pp-composer__main { flex: 1; min-width: 0; }
.pp-composer__inputwrap { position: relative; }
.pp-composer__input {
  min-height: 44px; padding: 11px 14px; border: 1px solid var(--border-strong); border-radius: 12px;
  background: var(--surface); color: var(--text); font-size: 13.5px; line-height: 1.55; outline: none;
  white-space: pre-wrap; overflow-wrap: anywhere; transition: border-color .15s, box-shadow .15s;
}
.pp-composer--active .pp-composer__input { min-height: 76px; }
.pp-composer__input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 16%, transparent); }
.pp-composer__input:empty::before { content: attr(data-placeholder); color: var(--text-subtle); pointer-events: none; }
.pp-composer__input :deep(.pp-mention) {
  display: inline; padding: 1px 6px; margin: 0 1px; border-radius: 6px; font-weight: 600;
  color: var(--info); background: color-mix(in srgb, var(--info) 12%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--info) 40%, transparent); white-space: nowrap;
}
/* @mention dropdown */
.pp-mentionmenu {
  position: absolute; top: calc(100% + 6px); left: 0; z-index: 40; width: min(320px, 100%);
  max-height: 264px; overflow-y: auto; padding: 6px; background: var(--surface); border: 1px solid var(--border);
  border-radius: 12px; box-shadow: var(--shadow-pop); display: flex; flex-direction: column; gap: 2px;
}
.pp-mentionitem { display: flex; align-items: center; gap: 10px; width: 100%; text-align: left; padding: 8px 10px; border: none; background: none; border-radius: 8px; cursor: pointer; font: inherit; color: var(--text); }
.pp-mentionitem:hover, .pp-mentionitem--active { background: var(--surface-2); }
.pp-mentionitem__avatar { flex: none; display: grid; place-items: center; width: 30px; height: 30px; border-radius: 50%; overflow: hidden; background: color-mix(in srgb, var(--accent) 16%, transparent); color: var(--accent); font-size: 11px; font-weight: 700; }
.pp-mentionitem__avatar img { width: 100%; height: 100%; object-fit: cover; }
.pp-mentionitem__name { flex: 0 1 auto; font-size: 13.5px; font-weight: 600; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pp-mentionitem__sub { flex: none; margin-left: auto; font-size: 12px; color: var(--text-subtle); }
.pp-mentionmenu__empty { padding: 12px; font-size: 12.5px; color: var(--text-subtle); text-align: center; }
/* expanded footer */
.pp-composer__foot { margin-top: 10px; }
.pp-drop {
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
  padding: 18px; border: 1.5px dashed color-mix(in srgb, var(--primary) 45%, var(--border-strong));
  border-radius: 12px; background: color-mix(in srgb, var(--primary) 5%, transparent);
  color: var(--text-muted); font-size: 12.5px; font-weight: 600; cursor: pointer; text-align: center;
  transition: border-color .15s, background .15s;
}
.pp-drop:hover, .pp-drop--over { border-color: var(--primary); background: color-mix(in srgb, var(--primary) 10%, transparent); }
.pp-drop .pp-svg { width: 22px; height: 22px; color: var(--primary); }
.pp-drop__input { display: none; }
.pp-attpreview { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
.pp-attchip { position: relative; }
.pp-attchip--img { width: 60px; height: 60px; border-radius: 10px; overflow: hidden; border: 1px solid var(--border); background: var(--surface-2); }
.pp-attchip--img img { width: 100%; height: 100%; object-fit: cover; display: block; }
.pp-attchip--file { display: inline-flex; align-items: center; gap: 7px; max-width: 220px; padding: 8px 28px 8px 11px; border-radius: 9px; border: 1px solid var(--border); background: var(--surface-2); color: var(--text-muted); font-size: 12.5px; font-weight: 600; }
.pp-attchip--file .pp-svg { width: 15px; height: 15px; flex: none; color: var(--danger); }
.pp-attchip__name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pp-attchip__x { position: absolute; top: -6px; right: -6px; display: grid; place-items: center; width: 20px; height: 20px; border-radius: 50%; border: none; background: var(--text); color: var(--surface); cursor: pointer; box-shadow: var(--shadow-sm); }
.pp-attchip__x .pp-svg { width: 12px; height: 12px; }
.pp-attchip--file .pp-attchip__x { top: 50%; right: 6px; transform: translateY(-50%); width: 18px; height: 18px; background: transparent; color: var(--text-subtle); box-shadow: none; }
.pp-attchip--file .pp-attchip__x:hover { color: var(--danger); }
.pp-composer__actions { display: flex; align-items: center; gap: 8px; margin-top: 12px; }
.pp-composer__spacer { flex: 1; }
.pp-composer__tool { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 9px; border: 1px solid var(--border); background: var(--surface); color: var(--text-muted); cursor: pointer; transition: background .15s, color .15s, border-color .15s; }
.pp-composer__tool:hover { background: var(--surface-2); color: var(--text); border-color: var(--border-strong); }
.pp-composer__tool .pp-svg { width: 17px; height: 17px; }
.pp-feed { list-style: none; margin: 0; padding: 0; }
.pp-feeditem { display: flex; gap: 12px; padding-bottom: 18px; position: relative; }
.pp-feeditem::before { content: ""; position: absolute; left: 17px; top: 40px; bottom: 0; width: 2px; background: var(--border); }
.pp-feeditem--last { padding-bottom: 0; }
.pp-feeditem--last::before { display: none; }
.pp-feeditem__avatar { flex: none; display: grid; place-items: center; width: 36px; height: 36px; border-radius: 50%; overflow: hidden; background: color-mix(in srgb, var(--accent) 16%, transparent); color: var(--accent); font-weight: 700; font-size: 12px; z-index: 1; }
.pp-feeditem__avatar img { width: 100%; height: 100%; object-fit: cover; }
.pp-feeditem__body { flex: 1; min-width: 0; }
.pp-feeditem__head { display: flex; align-items: center; gap: 8px; margin-bottom: 3px; flex-wrap: wrap; }
.pp-feeditem__head strong { color: var(--text); font-size: 13px; }
.pp-feeditem__head .pp-muted { font-size: 12px; }
.pp-feeditem__activity { color: var(--text); font-weight: 600; font-size: 13px; }
.pp-feeditem__text { margin: 0; color: var(--text-muted); font-size: 13.5px; overflow-wrap: anywhere; }
.pp-feeditem__text :deep(p) { margin: 0; }
.pp-feeditem__text :deep(a) { color: var(--info); }
.pp-feed__empty { color: var(--text-subtle); font-size: 13px; padding: 4px 0 2px; }
.pp-atts { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
.pp-att { text-decoration: none; cursor: pointer; font-family: inherit; padding: 0; border: none; }
.pp-att--img { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 9px; overflow: hidden; border: 1px solid var(--border); background: var(--surface-2); color: var(--text-subtle); }
.pp-att--img img { width: 100%; height: 100%; object-fit: cover; }
.pp-att--img .pp-svg { width: 20px; height: 20px; }
.pp-att--file { display: inline-flex; align-items: center; gap: 7px; max-width: 100%; padding: 8px 11px; border-radius: 9px; border: 1px solid var(--border); background: var(--surface-2); color: var(--text-muted); font-size: 12.5px; font-weight: 600; }
.pp-att--file:hover { border-color: var(--border-strong); color: var(--text); }
.pp-att--file .pp-svg { width: 15px; height: 15px; flex: none; color: var(--danger); }
.pp-att__name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.pp-pager { display: flex; align-items: center; justify-content: center; gap: 14px; padding-top: 14px; margin-top: 6px; border-top: 1px solid var(--border); }
.pp-pager__btn { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 9px; border: 1px solid var(--border); background: var(--surface); color: var(--text-muted); cursor: pointer; }
.pp-pager__btn:hover:not(:disabled) { background: var(--surface-3); color: var(--text); border-color: var(--border-strong); }
.pp-pager__btn:disabled { opacity: .4; cursor: default; }
.pp-pager__btn .pp-svg { width: 16px; height: 16px; }
.pp-pager__info { font-size: 13px; font-weight: 600; color: var(--text-muted); min-width: 96px; text-align: center; }

/* Footer actions */
.pp-actions {
  position: sticky; bottom: 0; z-index: 6;
  display: flex; justify-content: flex-end; gap: 10px;
  background: var(--surface); padding: 12px 2px; border-top: 1px solid var(--border);
  margin-bottom: 0;
}
.pp-btn { display: inline-flex; align-items: center; gap: 7px; padding: 10px 18px; border-radius: 10px; font-family: inherit; font-size: 14px; font-weight: 600; cursor: pointer; border: 1px solid transparent; transition: filter .15s, background .15s, border-color .15s; }
.pp-btn .pp-svg { width: 15px; height: 15px; }
.pp-btn--primary { background: var(--primary); color: #fff; }
.pp-btn--primary:hover:not(:disabled) { filter: brightness(1.05); }
.pp-btn--primary:disabled { opacity: .5; cursor: not-allowed; }
.pp-btn--ghost { background: var(--surface); border-color: var(--border-strong); color: var(--text-muted); }
.pp-btn--ghost:hover { background: var(--surface-3); color: var(--text); }

.pp-svg { display: block; }

/* Mobile: larger inputs to avoid iOS zoom */
@container (max-width: 560px) {
  .pp-root { font-size: 15px; }
  .pp-field__value { font-size: 15px; }
  .pp-input, .pp-input--ta { font-size: 16px; }
  .pp-pencil { opacity: 1; }
}
</style>
