/*
 * AddinRegistryUpdatedEvent.java
 *
 * Copyright (C) 2022 by Posit Software, PBC
 *
 * Unless you have received this program directly from Posit pursuant
 * to the terms of a commercial license agreement with Posit, then
 * this program is licensed to you under the terms of version 3 of the
 * GNU Affero General Public License. This program is distributed WITHOUT
 * ANY EXPRESS OR IMPLIED WARRANTY, INCLUDING THOSE OF NON-INFRINGEMENT,
 * MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE. Please refer to the
 * AGPL (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.
 *
 */
package org.rstudio.studio.client.workbench.addins.events;

import org.rstudio.studio.client.workbench.addins.Addins.RAddins;

import com.google.gwt.event.shared.EventHandler;
import com.google.gwt.event.shared.GwtEvent;

public class AddinRegistryUpdatedEvent extends GwtEvent<AddinRegistryUpdatedEvent.Handler>
{
   public AddinRegistryUpdatedEvent(RAddins data)
   {
      data_ = data;
   }

   public RAddins getData()
   {
      return data_;
   }

   private final RAddins data_;

   // Boilerplate ----

   public interface Handler extends EventHandler
   {
      void onAddinRegistryUpdated(AddinRegistryUpdatedEvent event);
   }

   @Override
   public Type<Handler> getAssociatedType()
   {
      return TYPE;
   }

   @Override
   protected void dispatch(Handler handler)
   {
      handler.onAddinRegistryUpdated(this);
   }

   public static final Type<Handler> TYPE = new Type<>();
}
