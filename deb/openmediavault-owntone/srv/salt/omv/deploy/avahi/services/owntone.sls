# This file is part of OpenMediaVault.
#
# @license   http://www.gnu.org/licenses/gpl.html GPL Version 3
# @author    Volker Theile <volker.theile@openmediavault.org>
# @copyright Copyright (c) 2009-2022 Volker Theile
#
# OpenMediaVault is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# any later version.
#
# OpenMediaVault is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with OpenMediaVault. If not, see <http://www.gnu.org/licenses/>.

# Documentation/Howto:
# https://github.com/owntone/owntone-server/blob/master/src/main.c#L224

{% set config = salt['omv_conf.get']('conf.service.owntone') %}
{% set zeroconf_enabled = salt['pillar.get']('default:OMV_OWNTONE_ZEROCONF_ENABLED', 1) %}

{% if not (config.enable | to_bool and zeroconf_enabled | to_bool) %}

remove_avahi_service_owntone:
  file.absent:
    - name: "/etc/avahi/services/owntone.service"

{% else %}

configure_avahi_service_owntone:
  file.managed:
    - name: "/etc/avahi/services/owntone.service"
    - source:
      - salt://{{ tpldir }}/files/owntone.j2
    - template: jinja
    - context:
        config: {{ config }}
    - user: root
    - group: root
    - mode: 644

{% endif %}
